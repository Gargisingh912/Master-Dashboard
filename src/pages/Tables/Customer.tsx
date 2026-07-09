
import PageMeta from "../../components/common/PageMeta";
import CustomerTable from "../../components/tables/BasicTables/CustomerTable";

export default function Customer() {
  return (
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="space-y-6">
          <CustomerTable />
      </div>
    </>
  );
}
