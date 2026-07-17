import PageMeta from "../../components/common/PageMeta";
import CustomerTable from "../../components/tables/BasicTables/CustomerTable";
import { useAuth } from "../../hooks/useAuth";

export default function Customer() {
  const { role } = useAuth();

  if (role === "admin") {
    return (
      <>
        <PageMeta title="Customers | Kitchen Dashboard" description="View customer details" />
        <div className="p-10 text-center text-gray-500">
          <h2 className="text-xl font-bold mb-2 text-red-500">Access Denied</h2>
          <p>You do not have permission to view the Customers page.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Customers | Kitchen Dashboard"
        description="View customer details"
      />
      <div className="space-y-6">
          <CustomerTable />
      </div>
    </>
  );
}
