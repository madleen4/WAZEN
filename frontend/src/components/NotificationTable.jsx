function NotificationTable({ notifications, deleteNotification }) {
  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Message</th>
            <th>Type</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {notifications.map((notification) => (
            <tr key={notification._id}>
              <td>{notification.title}</td>
              <td>{notification.message}</td>
              <td>{notification.type}</td>
              <td>{notification.date}</td>
              <td>
                <button
                  className="btn"
                  onClick={() => deleteNotification(notification._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {notifications.length === 0 && (
        <p className="message">No notifications yet.</p>
      )}
    </div>
  );
}

export default NotificationTable;