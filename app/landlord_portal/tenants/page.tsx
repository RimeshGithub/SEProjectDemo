export default function TenantsPage() {
  return(
    <>
      <section className="tenant-section">
          <div className="tenant-section-header">
            <h3>Tenants</h3>
            <button className="add-tenant-button">+ Add Tenant</button>
          </div>
          <table className="tenant-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Unit</th>
                <th>Rent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="name">
                  <img src="/avatar.jpeg" alt="Profile Pic" className="avatar" />
                  Jane Doe
                </td>
                <td>101A</td>
                <td>$1,200</td>
                <td><span className="status paid">Paid</span></td>
              </tr>
              <tr>
                <td className="name">
                  <img src="/avatar.jpeg" alt="Profile Pic" className="avatar" />
                  Mike Smith
                </td>
                <td>202B</td>
                <td>$1,050</td>
                <td><span className="status overdue">Overdue</span></td>
              </tr>
              <tr>
                <td className="name">
                  <img src="/avatar.jpeg" alt="Profile Pic" className="avatar" />
                  Linda Lee
                </td>
                <td>303C</td>
                <td>$1,300</td>
                <td><span className="status paid">Paid</span></td>
              </tr>
            </tbody>
          </table>
        </section>
    </>
  )
}