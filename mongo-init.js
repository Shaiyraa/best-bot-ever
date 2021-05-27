db.auth('mongoadmin', 'pass')

db = db.getSiblingDB('bestbot')

db.createUser({
    user: "test",
    pwd: "test",
    roles: [
        {
            role: 'readWrite',
            db: 'bestbot'
        }
    ]
})

