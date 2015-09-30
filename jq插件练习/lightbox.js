;(function($){
	console.log("1");
	var LightBox=function(){
		var self=this;
		//创建遮罩和弹出框
		this.popupMask=$('<div id="lightbox-mask">');
		this.popupWin=$('<div id="lightbox-popup">');
		//保存body
		this.bodyNode=$(document.body);
		//渲染剩余的DOM并且插入到body中
		this.renderDOM();
		//获取图片预览区域
		this.picViewArea=this.popupWin.find("div.lightbox-pic-view");
		//图片
		this.popupPic=this.popupWin.find("img.lightbox-image");
		//图片描述区域
		this.picCaptionArea=this.popupWin.find("div.lightbox-pic-caption");
		this.nextBtn=this.popupWin.find("span.lightbox-next-btn");
		this.prevBtn=this.popupWin.find("span.lightbox-prev-btn");
		this.captionText=this.popupWin.find("span.lightbox-pic-desc");
		this.currentIndex=this.popupWin.find("span.lightbox-index");
		this.closeBtn=this.popupWin.find("span.lightbox-close");
		//准备开发事件委托，获取数据
		this.groupName=null;
		this.groupData=[];
		this.bodyNode.delegate(".js-lightbox,*[data-role=lightbox]","click",function(e){
			//阻止事件冒泡
			e.stopPropagation();
			var currentGroupName=$(this).attr("data-group");
			if(currentGroupName!=self.groupName){
				self.groupName=currentGroupName;
				//根据当前组名获取同一组数据
				self.getGroup();
			}
			//初始化弹出框
			self.initPopup($(this));
		});
		this.popupMask.click(function(){
			$(this).fadeOut();
			self.popupWin.fadeOut();
		});
		this.closeBtn.click(function(){
			self.popupMask.fadeOut();
			self.popupWin.fadeOut();
		});
		this.flag=true;
		this.nextBtn.hover(function(){
			if(!$(this).hasClass("disabled")&&self.groupData.length>1){
				$(this).addClass("lightbox-next-btn-show");
			}
		},function(){
			if(!$(this).hasClass("disabled")&&self.groupData.length>1){
				$(this).removeClass("lightbox-next-btn-show");
			}
		}).click(function(e){
			if(!$(this).hasClass("disabled")&&self.flag){
				self.flag=false;
				e.stopPropagation();
				self.goto("next");
				console.log("mext");
			}
		});
		this.prevBtn.hover(function(){
			if(!$(this).hasClass("disabled")&&self.groupData.length>1){
				$(this).addClass("lightbox-prev-btn-show");
			}
		},function(){
			if(!$(this).hasClass("disabled")&&self.groupData.length>1){
				$(this).removeClass("lightbox-prev-btn-show");
			}
		}).click(function(e){
			if(!$(this).hasClass("disabled")){
				e.stopPropagation();
				self.goto("prev");
			}
		});
	};
	LightBox.prototype={
		showMaskandPopup:function(source,id){
			var self=this;
			this.popupPic.hide();
			this.picCaptionArea.hide();
			this.popupMask.fadeIn();
			var winWidth=$(window).width();
			var winHeight=$(window).height();
			this.picViewArea.css({
				width:winWidth/2,
				height:winHeight/2
			});
			var viewHeight=winHeight/2+10;
			this.popupWin.fadeIn();
			this.popupWin.css({
				width:winWidth/2+10,
				height:winHeight/2+10,
				marginLeft:-(winWidth/2+10)/2,
				top:-viewHeight}).animate({
					top:(winHeight-viewHeight)/2
				},function(){
					self.loadPicSize(source);
				});
			//根据当前点击的元素ID获取当前组别里的索引
			this.index=this.getIndexOf(id);
			console.log(this.index);
			var groupDataLength=this.groupData.length;
			if(groupDataLength>1){
				if(this.index===0){
					this.prevBtn.addClass("disabled");
					this.nextBtn.removeClass("disabled");
				}else if(this.index===groupDataLength-1){
					this.nextBtn.addClass("disabled");
					this.prevBtn.removeClass("disabled");
				}else{
					this.nextBtn.removeClass("disabled");
					this.prevBtn.removeClass("disabled");
				}
			}
		},
		goto:function(dir){
			if(dir==="next"){
				this.index++;
				if(this.index>=this.groupData.length-1){
					this.nextBtn.addClass("disabled").removeClass("lightbox-next-btn-show");
				}
				if(this.index!=0){
					this.prevBtn.removeClass("disabled");
				}
				var src=this.groupData[this.index].src;
				this.loadPicSize(src);
			}else if(dir==="prev"){
				this.index--;
				if(this.index<=0){
					this.prevBtn.addClass("disabled").removeClass("lightbox-prev-btn-show");
				}
				if(this.index!=this.groupData.length-1){
					this.nextBtn.removeClass("disabled");
				}
				var src=this.groupData[this.index].src;
				this.loadPicSize(src);
			}
		},
		loadPicSize:function(sourcrSrc){
			var self=this;
			self.popupPic.css({
				width:"auto",
				height:"auto"
			}).hide();
			this.prelLoadImg(sourcrSrc,function(){
				self.popupPic.attr("src",sourcrSrc);
				var picWidth=self.popupPic.width();
				var picHeight=self.popupPic.height();
				console.log(picWidth+"+"+picHeight);
				self.changePic(picWidth,picHeight);
			});
		},
		changePic:function(width,height){
			var self=this,
			 winWidth=$(window).width(),
			 winHeight=$(window).height();
			 var swidth=winWidth/(width+10);
			 var sheight=winHeight/(height+10);
			//如果图片的宽高大于浏览器视口的宽高比例，我们就看下是否溢出
			var scale=Math.min(swidth,sheight,1);
			width=width*scale;
			height=height*scale;
			this.picViewArea.animate({
				width:width-10,
				height:height-10
			});
			this.popupWin.animate({
				width:width,
				height:height,
				marginLeft:-(width/2),
				top:(winHeight-height)/2
			},function(){
				self.popupPic.css({
					width:width-10,
					height:height-10
				}).fadeIn();
				self.picCaptionArea.fadeIn();
				self.flag=true;
			});
			//设置当前文字描述和索引
			this.captionText.text(this.groupData[this.index].caption);
			var index=this.index+1;
			this.currentIndex.text("当前索引："+index+" of "+this.groupData.length);
		},
		//判断图片是否加载完毕
		prelLoadImg:function(src,callback){
			var img=new Image();
			if(!!window.ActiveXObject){
				img.onreadystatechange=function(){
					if(this.readyState=="complete"){
						callback();
					};
				};
			}else{
				img.onload=function(){
					callback();
				};
			};
			img.src=src;
		},
		//获取图片索引
		getIndexOf:function(currentId){
			var index=0;
			$(this.groupData).each(function(i){
				index=i;
				if(this.id===currentId){
					return false;
				}
			});
			return index;
		},
		//实例弹出框
		initPopup:function(currentObj){
			var self=this;
			var sourcrSrc=currentObj.attr("data-source");
			var currentId=currentObj.attr("data-id");
			this.showMaskandPopup(sourcrSrc,currentId);
		},
		getGroup:function(){
			var self=this;
			var groupList=this.bodyNode.find("*[data-group="+this.groupName+"]");
			self.groupData.length=0;
			groupList.each(function(){
				self.groupData.push({
					src:$(this).attr("data-source"),
					id:$(this).attr("data-id"),
					caption:$(this).attr("data-caption")
				});

			});
			console.log(self.groupData);
		},
		renderDOM:function(){
			var strDom='<div class="lightbox-pic-view">'+
						'<span class="lightbox-btn lightbox-prev-btn "></span>'+
						'<img  class="lightbox-image" src="images/2-2.jpg" >'+
						'<span class="lightbox-btn lightbox-next-btn"></span>'+
						'</div>'+
						'<div class="lightbox-pic-caption">'+
						'<div class="lightbox-caption-area">'+
						'<span class="lightbox-pic-desc">图片</span>'+
						'<span class="lightbox-index">索引</span>'+
						'</div>'+
						'<span class="lightbox-close"></span>'+
						'</div>';
			this.popupWin.html(strDom);
			this.bodyNode.append(this.popupMask,this.popupWin);
		}
	};
	window['LightBox']=LightBox;
})(jQuery);