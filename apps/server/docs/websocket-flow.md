Client Start
   │
   ├─> Connect WebSocket
   │
   ├─> Fetch all messages (REST API)
   │
   └─> Listen WebSocket events
           │
           ├─> On "messageCreated": tambah pesan ke memory
           ├─> On "messageDeleted": hapus pesan dari memory
           └─> dst...