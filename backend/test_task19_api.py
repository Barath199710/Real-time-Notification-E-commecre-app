import unittest
import json
from app import app, socketio
from database import init_db, get_db_connection

class Task19BackendTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()
        init_db()

        self.admin_email = "admin_task19@example.com"
        self.customer_email = "customer_task19@example.com"
        self.password = "password123"

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE email IN (?, ?)", (self.admin_email, self.customer_email))
        cursor.execute("DELETE FROM notifications")
        conn.commit()
        conn.close()

        # Register Admin
        res_admin = self.client.post('/api/register', json={
            "name": "Task 19 Admin",
            "email": self.admin_email,
            "password": self.password,
            "role": "admin"
        })
        self.admin_token = res_admin.get_json()['access_token']
        self.admin_headers = {'Authorization': f'Bearer {self.admin_token}'}

        # Register Customer
        res_cust = self.client.post('/api/register', json={
            "name": "Task 19 Customer",
            "email": self.customer_email,
            "password": self.password,
            "role": "customer"
        })
        self.customer_token = res_cust.get_json()['access_token']
        self.customer_headers = {'Authorization': f'Bearer {self.customer_token}'}

    def test_01_create_order_emits_and_persists_notification(self):
        # Customer places order
        res = self.client.post('/api/orders', json={
            "product_id": 1,
            "items_count": 1
        }, headers=self.customer_headers)
        self.assertEqual(res.status_code, 201)
        order_data = res.get_json()
        self.assertIn('id', order_data)

        # Admin fetches notifications
        n_res = self.client.get('/api/notifications', headers=self.admin_headers)
        self.assertEqual(n_res.status_code, 200)
        notifications = n_res.get_json()['notifications']
        self.assertGreaterEqual(len(notifications), 1)
        self.assertEqual(notifications[0]['type'], 'order')
        self.assertIn(f"New order #{order_data['id']}", notifications[0]['message'])
        self.assertFalse(notifications[0]['is_read'])
        print("\n[TEST PASS] Creating order persists notification for admin.")

    def test_02_mark_single_notification_as_read(self):
        # Create order first
        self.client.post('/api/orders', json={"product_id": 1, "items_count": 1}, headers=self.customer_headers)
        
        n_res = self.client.get('/api/notifications', headers=self.admin_headers)
        n_id = n_res.get_json()['notifications'][0]['id']

        # Mark read
        read_res = self.client.put(f'/api/notifications/{n_id}/read', headers=self.admin_headers)
        self.assertEqual(read_res.status_code, 200)

        # Verify read state
        n_res_2 = self.client.get('/api/notifications', headers=self.admin_headers)
        target = [n for n in n_res_2.get_json()['notifications'] if n['id'] == n_id][0]
        self.assertTrue(target['is_read'])
        print("\n[TEST PASS] PUT /api/notifications/<id>/read marks single notification as read.")

    def test_03_mark_all_notifications_as_read(self):
        # Create multiple orders
        self.client.post('/api/orders', json={"product_id": 1, "items_count": 1}, headers=self.customer_headers)
        self.client.post('/api/orders', json={"product_id": 2, "items_count": 1}, headers=self.customer_headers)

        # Mark all read
        read_all_res = self.client.put('/api/notifications/read-all', headers=self.admin_headers)
        self.assertEqual(read_all_res.status_code, 200)

        # Verify all read
        n_res = self.client.get('/api/notifications', headers=self.admin_headers)
        for n in n_res.get_json()['notifications']:
            self.assertTrue(n['is_read'])
        print("\n[TEST PASS] PUT /api/notifications/read-all marks all user notifications as read.")

    def test_04_delete_notification(self):
        self.client.post('/api/orders', json={"product_id": 1, "items_count": 1}, headers=self.customer_headers)
        n_res = self.client.get('/api/notifications', headers=self.admin_headers)
        n_id = n_res.get_json()['notifications'][0]['id']

        del_res = self.client.delete(f'/api/notifications/{n_id}', headers=self.admin_headers)
        self.assertEqual(del_res.status_code, 200)

        n_res_after = self.client.get('/api/notifications', headers=self.admin_headers)
        ids = [n['id'] for n in n_res_after.get_json()['notifications']]
        self.assertNotIn(n_id, ids)
        print("\n[TEST PASS] DELETE /api/notifications/<id> successfully deletes notification.")

    def test_05_socketio_connection_and_join_room(self):
        socket_client = socketio.test_client(app)
        self.assertTrue(socket_client.is_connected())

        socket_client.emit('join', {'user_id': 10, 'role': 'admin'})
        received = socket_client.get_received()
        self.assertGreaterEqual(len(received), 1)
        self.assertEqual(received[0]['name'], 'joined')
        self.assertEqual(received[0]['args'][0]['role'], 'admin')
        socket_client.disconnect()
        print("\n[TEST PASS] SocketIO connection and room join handler verified successfully.")

if __name__ == '__main__':
    unittest.main()
