const adminDB = db.getSiblingDB('admin');

// Attempt to initiate the replica set
try {
  rs.initiate();
  print('Replica set initiation command sent.');
} catch (e) {
  print('Replica set initiation failed: ' + e);
}

// Check if the replica set is properly initialized
while (true) {
  if (rs.status().myState === 1) {
    print('Replica set initialized successfully.');
    break;
  }
  print('Waiting for replica set to initialize...');
  sleep(1000);
}

// Optional: You can add an additional delay to ensure readiness
sleep(5000); // 5 seconds delay

// Create the root user
adminDB.createUser({
  user: 'root',
  pwd: 'example', // Replace with your desired password
  roles: [{ role: 'root', db: 'admin' }],
});

print('Root user created successfully.');
