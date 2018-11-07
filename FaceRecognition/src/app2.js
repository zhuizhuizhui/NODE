/**AipFaceClient是人脸识别的node客户端，为人脸识别的开发人员提供的接口*/
/*人脸识别detect*/

const   AipFaceClient=require('baidu-aip-sdk').face,
        //参数设置
        APP_ID='14618870',
        API_KEY='r7devpiArGAentr3jv7D8XKo',
        SERCRET_KEY='w9FmBk1pXkncqjNFswpI9XZqUskoEk23',
        //新建一个对象，调用服务接口
        client=new AipFaceClient(APP_ID,API_KEY,SERCRET_KEY),

        HttpClient=require('baidu-aip-sdk').HttpClient;

        //设置Rrequest库的一些参数，如代理服务器地址，超时时间..
        HttpClient.setRequestOptions({timeout:5000})

        let fs=require('fs'),
            image=fs.readFileSync('./images/2.jpg','base64'),
            imageType = "BASE64",
            options={
                "face_field":'face_shape,beauty'
            };

    // 调用人脸检测
    client.detect(image, imageType,options).then(function(result) {
        console.log(JSON.stringify(result));
    }).catch(function(err) {
        // 如果发生网络错误
        console.log(err);
    });