// モジュール
var aws = require('aws-sdk'); // AWS SDKモジュール
var docClient = new aws.DynamoDB.DocumentClient({region: 'ap-northeast-1'});

//時刻表示用の関数
function getTimeStr() {
    var d = new Date();
    var yyyy = d.getUTCFullYear();
    var MM = ('0' + (d.getUTCMonth() + 1)).slice(-2);
    var dd = ('0' + d.getUTCDate()).slice(-2);
    var hh = ('0' + d.getUTCHours()).slice(-2);
    var mm = ('0' + d.getUTCMinutes()).slice(-2);
    var ss = ('0' + d.getUTCSeconds()).slice(-2);
    return yyyy + '-' + MM + '-' + dd + 'T' + hh + ':' + mm + ':' + ss + '+09:00';
}

/**
* リクエストが送られてきたときのハンドラー
*/
exports.handler = function(req, context, callback) {
    console.log("401 start.");
    console.log("402 request : " + JSON.stringify(req));
    console.log("403 context : " + JSON.stringify(context));
    console.log("404 request-headers : " + req.headers);
    console.log("405 request-body : " + req.body);
    // リクエストのbodyをJSONにする
    var sensor = req;
    if (sensor != null) {
         // センサーデータの内容を表示
        console.log("406 sensor - id : " + sensor["id"]);
        console.log("406 sensor - keydata : " + sensor["keydata"]);
        console.log("406 sensor - unixtime : " + sensor["unixtime"]);
        console.log("406 sensor - sensor_value : " + sensor["sensor_value"]);
        console.log("406 sensor - datatype : " + sensor["datatype"]);
        //UNIX時間からの変換
        console.log("406 unixtime → JST : "+ getTimeStr());
        // DynamoDBに登録
        registWebiotSensor(sensor);
         }
         else {
                 // リクエストのBodyがない場合はエラー
                 console.log("999 error! request body is null !!! ");
                 console.error("999 request body is null !");
         }
         // レスポンス＆コールバック
         const response = {
         statusCode: 200,
                 headers: {
                         "Access-Control-Allow-Origin" : "https://s3-ap-northeast-1.amazonaws.com",
                         "Access-Control-Allow-Credentials" : true, // Required for cookies, authorization headers with HTTPS
                         "Access-Control-Allow-Headers" : "Origin, X-Requested-With, Content-Type, Accept"
                 },
                 body: JSON.stringify({ "message": "lamdba function is callback!" })
         };
         callback(null, response);
         console.log("499 end!");
};
/**
* Webiotセンサー情報の登録
*/
var registWebiotSensor = function(sensor) {
    console.log("501 [regist] start !");
    // 登録するセンサー情報
    var params = {
        TableName : "iTeru",
        Item : {
            "id" : sensor["id"],
            "keydata" : sensor["keydata"],
            "time" : getTimeStr(),
            "sensor_value" : sensor["sensor_value"],
            "datatype" : sensor["datatype"]
        }
    };
    // 値が空文字の補完（DynamoDBが空文字を受け付けないための補完処理）
    for (var key in params.Item) {
        for (var items in params.Item[key]) {
            var value = params.Item[key][items];
            if (value === undefined || value === "") {
                value = "N/A";
            }
        }
    }
    // センサー情報を登録
    docClient.put(params, function(err, data) {
        if (err) {
            console.log("503 [regist] insert webiot_sensor faild. Error : ", JSON.stringify(err));
        } else {
            console.log("504 [regist] insert webiot_sensor success.", data);
        }
    });
    console.log("599 [regist] end ! ");
};