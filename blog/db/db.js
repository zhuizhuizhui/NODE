const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    settings = require('./settings');

const blogModel = mongoose.model('regInfo', new Schema({
    username: { type: String, unique: true },
    password: String,
    email: String,
    head:Object//头像
}, {
        versionKey: false//去掉版本锁
    }));

const articleModel = mongoose.model('atriclesInfo', new Schema({
    username: String,
    head:Object,    
    time: Object,
    title: { type: String, unique: true },//设置唯一
    tags:Array,
    post: String,
    comments: Array,
    pv:Number
}, {
        versionKey: false//去掉版本锁
    }));

function Db() {
    mongoose.connect(settings.url, err => {
        if (err) throw err;
        console.log('连接成功!');
    })
}
module.exports = Db;

Db.prototype.insertUser = (data, cb) => {
    blogModel.insertMany(data, (err, result) => {
        cb(err, result);//返回结果
    })
}

Db.prototype.findUser = (data, cb) => {
    blogModel.find(data, (err, result) => {
        if (err) throw err;
        cb(result);//返回结果
    })
}

Db.prototype.insertArticle = (data, cb) => {
    articleModel.insertMany(data, (err, result) => {
        cb(err, result);//返回结果
    })
}

Db.prototype.findArticle = (data, cb) => {
    articleModel.find(data, (err, result) => {
        if (err) throw err;
        cb(result);//返回结果
    })
}

Db.prototype.findArticleNum=(num,page,cb)=>{       
    articleModel.find({})                                  
                .skip((page-1)*num)
                .limit(num)
                .exec((err,res)=>{
                    articleModel.countDocuments((err,counts)=>{                                            
                        cb(err,res,counts);
                    })                    
                })
}

Db.prototype.getArchive=(cb)=>{
    articleModel.find({},{
        '_id':0,
        'username':1,
        'title':1,
        'time':1        
    }).sort({
        'time':-1
    }).exec((err,res)=>{     
        cb(err,res);
    })
}

Db.prototype.updateArticle = (data,condition,cb) => {
    articleModel.update(data, condition,(err, raw) => {
        cb(err, raw);
    })
}

Db.prototype.findANDupdate = (data, info, cb) => {
    articleModel.findOneAndUpdate(data, { $push: { comments: info } }, { new: true }, (err, doc) => {
        cb(err, doc);
    })
}

Db.prototype.removeArticle = (data, cb) => {
    articleModel.deleteOne(data, err => {
        cb(err);
    })
}

Db.prototype.getTags=(cb)=>{
    articleModel.distinct('tags',(err,docs)=>{
        cb(err,docs)
    })
}

/* Db.prototype.getTag=(tag,cb)=>{    
    articleModel.find({
                    tags:tag
                },{
                    _id:0,
                    username:1,
                    time:1,
                    title:1
                }).sort({ 
                    time:-1 
                }).exec((err,docs)=>{                    
                    cb(err,docs)
                })
} */
Db.prototype.getOne=(condition,cb)=>{    
    articleModel.find(condition,{
                    _id:0,
                    username:1,
                    time:1,
                    title:1
                }).sort({ 
                    time:-1 
                }).exec((err,docs)=>{                    
                    cb(err,docs)
                })
}