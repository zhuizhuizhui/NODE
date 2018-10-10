let crypto = require('crypto'),
  User = require('../db/user'),
  Post = require('../db/post');

module.exports = function (app) {
  let num=3;
  app.get('/',(req,res)=>{
   let  page=req.query.p?parseInt(req.query.p):1;
    Post.getNum(num,page,(err,result,total)=>{
      if(err)
        result=[];

        res.render('index',{
          title:'主页',
          name:req.flash('name').toString(),
          posts:result,
          page:page,
          isFirstPage:(page-1)==0,
          isLastPage:((page-1)*num+result.length)==total,
          user:req.session.user,
          success:req.flash('success').toString(),
          error:req.flash('err').toString()
        });
    })
  })

  app.get('/reg', checkNotLogin);
  app.get('/reg', function (req, res) {
     res.render('reg', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('err').toString()
    });    
  });

  app.post('/reg', checkNotLogin);
  app.post('/reg', function (req, res) {
    let name = req.body.name,
      pwd = req.body.password,
      email = req.body.email,
      md5 = crypto.createHash('md5'),
      password = md5.update(pwd).digest('hex'),
      newUser = new User({
        name: name,
        password: password,
        email: email
      });    
    newUser.save(function (err, user) {
      if (err) {
        req.flash('err', '注册失败---用户名已被占用!');
        return res.redirect('/reg');//注册失败返回主册页
      }      
      req.flash('success', '注册成功!');
      res.redirect('/login');//注册成功后返回登录页面
    })
  });

  app.get('/login', checkNotLogin);
  app.get('/login', function (req, res) {
    res.render('login', {
      title: '主页',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('err').toString()
    });    
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
    let md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');    
    User.get(req.body.name, user => {  
      console.log('userLength---',user.length)   
      if (!user.length) {        
        req.flash('err', '该用户不存在!')
        return res.redirect('/login');
      }
      if (user[0].password != password) {
        req.flash('err', '密码错误!');
        return res.redirect('/login');
      }

      req.session.user = user;
      req.flash('name', req.body.name);
      req.flash('success', '登录成功!');
      res.redirect('/');
    })


  });

  app.get('/post', checkLogin);
  app.get('/post', function (req, res) {
    res.render('post', {
      title: '发表',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('err').toString()
    });    
  });

  app.post('/post', checkLogin)
  app.post('/post', function (req, res) {
    let tags=[req.body.tag1,req.body.tag2,req.body.tag3],
        post = new Post(req.session.user[0].username, req.body.title,tags, req.body.post,req.session.user[0].head);
    post.save((err, reuslt) => {
      if (err) {
        req.flash('err', '发表失败---文章标题重复');
        return res.redirect('/post');
      }
      req.flash('success', '发表成功!');
      res.redirect('/');//重定向到主页
    })
  });

  app.get('/logout', checkLogin);
  app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '退出成功!');
    res.redirect('/');//登出成功后跳转到主页
  });

  app.get('/upload', checkLogin);
  app.get('/upload', (req, res) => {
   res.render('upload', {
      title: '文件上传',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('err').toString()
    })    
  });

  app.post('/upload', checkLogin);
  app.post('/upload', function (req, res) {
    req.flash('success', '文件上传成功!');
    res.redirect('/upload');
  });

  app.get('/archive',(req,res)=>{
    Post.getArchive((err,posts)=>{
      if(err){
        req.flash('err',err);
        return res.redirect('/');
      }

      res.render('archive',{
        title:'存档',
        posts:posts,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('err').toString()
      })
    })
  })

  app.get('/tags',(req,res)=>{
       Post.getTags((err,posts)=>{
        if(err){
          req.flash('err',err);
          return res.redirect('/');
        }

        res.render('tags',{
          title:'标签',
          posts:posts,
          user:req.session.user,
          success:req.flash('success').toString(),
          error:req.flash('err').toString()
        })
       }) 
  })

  app.get('/tags/:tag',(req,res)=>{
    Post.getTag(req.params.tag,(err,posts)=>{
      if(err){
        req.flash('err',err);
        return res.redirect('/');
      }
      res.render('tag',{
        title:'TAG:'+req.params.tag,
        posts:posts,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('err').toString()
      })
    })
  })
  
  app.get('/search',(req,res)=>{
    Post.search(req.query.keyword,(err,posts)=>{
      console.log('keyword----',req.body.keyword)
      if(err||!posts.length){        
        req.flash('err','文章不存在');
        return res.redirect('/');
      }

      //可以共用tag.ejs
      res.render('search',{
        title:'Search:'+req.query.keyword,
        posts:posts,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('err').toString()
      })
    })
  })


  app.get('/links',(req,res)=>{
    res.render('links',{
      title:'友情链接',
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('err').toString()
    })
  })
  app.get('/u/:name',(req,res)=>{
    let page=req.query.p?parseInt(req.query.p):1,
        info={username:req.params.name};
      User.get(req.params.name,user=>{
        if(!user){
          req.flash('err','用户不存在!');
          return res.redirect('/');
        }

        Post.getNum(num,page,(err,result,total)=>{
          if(err){
            req.flash('err',err);
            return res.redirect('/');
          }

          res.render('user',{
            title:info.username,
            posts:result,
            page:page,
            isFirstPage:(page-1)==0,
            isLastPage:((page-1)*num+result.length)==total,
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('err').toString()
          })
        })
      })
    
  })

  app.get('/u/:name/:day/:title', function (req, res) {        
      let info={'username':req.params.name,'time.day':req.params.day,'title':req.params.title};
      Post.get(info, result => {
        if (!result) {//如果为null
          req.flash('err', '内容不存在!')
          return res.redirect('/')
        }     

        res.render('article', {
          title: result[0].title,
          post: result[0],
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('err').toString()
        });      
      })
  })

  app.post('/u/:name/:day/:title',function(req,res){
    let date=new Date(),
      time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()),
        
        md5=crypto.createHash('md5'),
        email_MD5=md5.update(req.body.email.toLowerCase()).digest('hex'),
        head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48",

      comment={name:req.body.name,
              email:req.body.email,
              head:head,
              website:req.body.website,
              time:time,
              content:req.body.content
            },
      condition={'username':req.params.name,'time.day':req.params.day,'title':req.params.title};
      Post.pushComment(condition,comment,(err,doc)=>{
        if(err){
          req.flash('err',err);
          return res.redirect('back');
        }

        req.flash('success','留言成功～');
        res.redirect('back');
      })

    })

  app.get('/edit/:name/:day/:title', checkLogin);
  app.get('/edit/:name/:day/:title',function(req,res){
    let info = { 'username': req.params.name, 'time.day': req.params.day, 'title': req.params.title };    
    Post.edit(info,article=>{   
      if(!article.length){
        req.flash('err',err);
        return res.redirect('back');//返回上一级
      }

      res.render('edit',{
        title:'编辑',
        post:article[0],
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('err').toString()
      })
    })
  })

  app.post('/edit/:name/:day/:title',checkLogin);
  app.post('/edit/:name/:day/:title',function(req,res){
    let info = { 'username': req.params.name, 'time.day': req.params.day, 'title': req.params.title,'post':req.body.post },
       url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title),
       condition=null;       
    Post.update(info,condition,(err,raw)=>{      
      if(err){
        req.flash('err',err);
        return res.redirect(url);
      }

      req.flash('success','更新成功~~');
      res.redirect(url);
    })
  })

  app.get('/remove/:name/:day/:title', checkLogin);
  app.get('/remove/:name/:day/:title', function (req, res) {
    let info = { 'username': req.params.name, 'time.day': req.params.day, 'title': req.params.title };
    Post.remove(info, err => {      
      if (err) {
        req.flash('err', err);
        return res.redirect('back');//返回上一级
      }

      req.flash('success','删除成功!');
      res.redirect('/');
    })
  })
   
  //当所有访问路径都不匹配时，渲染404
  app.use(((req, res) => {
    res.render('404')
  }))
  
  function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash('err', '未登录!')
      return res.redirect('/login');
    }
    next();
  }

  function checkNotLogin(req, res, next) {    
    if (req.session.user) {
      req.flash('err', '已登录！');
      return res.redirect('back');//返回之前的页面
    }
    next();
  }
};