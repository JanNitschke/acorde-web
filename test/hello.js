
exports.handle = async(msg, sendMessage) => {
    msg.res.body = "Hello world! req:"+ JSON.stringify(msg) ;
    msg.res.headers["test"] = "ja!";
    msg.res.status = 200;

    return msg;
};

exports.end = () => null; 