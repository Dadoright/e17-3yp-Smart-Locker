const databaseConnection = require("./config/databaseConfig");

const mqtt = require("mqtt");


publisher = async() => {
    const connection = await databaseConnection.createConnection();
    let table_name = "Locker";
    const getLockerData = `SELECT * FROM ${table_name}`;
    let lockerData;
    try {
        const [response] = await connection.promise().execute(getLockerData);
        lockerData = response;
        console.log("Successful Retrieved");
    } catch (error) {
        console.log(error.message);
    }
    var options = {
        host: 'f52e464d5ba446bbb7ce1e8bf72f8221.s2.eu.hivemq.cloud',
        port: 8883,
        protocol: 'mqtts',
        username: 'SmartLocker',
        password: 'SmartLocker1'
    }

    var client = mqtt.connect(options);
    client.on("connect", function() {
        console.log("connected to publishing availability");
        for (let i = 0; i < lockerData.length; i++) {
            lockerlocationid = lockerData[i].ClusterID;
            lockerNumber = lockerData[i].LockerNumber;
            const data = { availability: lockerData[i].Availability };
            const stringData = JSON.stringify(data);
            console.log(
                `${stringData}\tTopic: SmartLockerAvailability/${lockerlocationid}/${lockerNumber}`
            );
            client.publish(
                `SmartLockerAvailability/${lockerlocationid}/${lockerNumber}`,
                stringData
            );
        }
    });
};


setInterval(publisher, 5000);