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

db.createCollection('events')

db.events.save({
    type: "nodewar",
    date: "02.02.2021",
    maxAttendance: 100
})

db.events.save({
    type: "nodewar",
    date: "04.02.2021",
    maxAttendance: 100
})