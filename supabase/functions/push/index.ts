import { withSupabase } from 'npm:@supabase/server@^1'
import { JWT } from 'npm:google-auth-library@^10'
import serviceAccount from '../service-account.json' with { type: 'json' }

interface Notification {
  id: string
  user_id: string
  body: string
}

interface WebhookPayload {
  type: 'INSERT'
  table: string
  record: Notification
  schema: 'public'
}

// Triggered by a Database Webhook, which authenticates with a secret key.
// Deploy with `verify_jwt = false`.
export default {
  fetch: withSupabase({ auth: 'secret' }, async (req, ctx) => {
    console.log('Function invoked')

    const payload: WebhookPayload = await req.json()
    console.log('Payload received:', JSON.stringify(payload))

    const { data, error: profileError } = await ctx.supabaseAdmin
      .from('profiles')
      .select('fcm_token')
      .eq('id', payload.record.user_id)
      .single()

    if (profileError) {
      console.error('Failed to fetch profile:', profileError)
      throw profileError
    }

    console.log('Profile fetched, fcm_token present:', !!data?.fcm_token)

    const fcmToken = data!.fcm_token as string

    if (!fcmToken) {
      console.error('No fcm_token found for user:', payload.record.user_id)
      return Response.json({ error: 'No fcm_token' }, { status: 400 })
    }

    const accessToken = await getAccessToken({
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    })
    console.log('Access token generated:', !!accessToken)

    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            token: fcmToken,
            notification: {
              title: `New Order!!`,
              body: payload.record.body,
            },
            data: {
              url: '/dashboard/kitchen/orders'
            }
          },
        }),
      }
    )

    const resData = await res.json()
    console.log('FCM response status:', res.status)
    console.log('FCM response body:', JSON.stringify(resData))

    if (res.status < 200 || 299 < res.status) {
      throw resData
    }

    return Response.json(resData)
  }),
}

const getAccessToken = ({
  clientEmail,
  privateKey,
}: {
  clientEmail: string
  privateKey: string
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    const jwtClient = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    })
    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err)
        return
      }
      resolve(tokens!.access_token!)
    })
  })
}