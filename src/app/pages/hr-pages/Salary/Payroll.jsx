export default function Payroll() {
  const payrollData = [
    {
      name: "Aman Patel",
      month: "March",
      netSalary: 42000,
      status: "Paid",
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Payroll</h2>

      <div className="overflow-x-auto">
      <table className="table table-zebra min-w-100">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Month</th>
            <th>Salary</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {payrollData.map((item, i) => (
            <tr key={i}>
              <td>{item.name}</td>
              <td>{item.month}</td>
              <td>₹{item.netSalary}</td>
              <td>
                <span className="badge badge-success">
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}