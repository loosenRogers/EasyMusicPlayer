window.onload = function(){
	var player = document.getElementById('player');
	var playtime = document.getElementById("playtime");
	
	// alert(parseInt(player.duration));
	// player.oncanplay = alert("Can start play music");
	player.addEventListener("canplay",function(){
		var totalTime = Math.ceil(player.duration);
		var sec = totalTime%60;
		var min = parseInt(totalTime/60);
		// alert(min);
		playtime.innerHTML = min+":"+sec;
		// timecontrol(player);
		// timeshow(player);
	});
	timecontrol(player);
	control(player);
	voicecontrol(player);
	LyrControl("little_lucky.trc",player);
}

function control(player){
	var fond = true;//喜欢按钮
	var controlPart = document.getElementById('control');
	var button1 = controlPart.getElementsByTagName('span')[0];
	var button3 = controlPart.getElementsByTagName('span')[2];
	button1.onclick = function(){
		if(player.paused){
			player.play();
			this.innerHTML = "&#xe696;"
			timeshow(player);
			// playtime.innerHTML = Math.ceil(player.duration);
		}
		else{
			player.pause();
			this.innerHTML = "&#xe628;"
		}
	}

	button3.onclick = function(){
		if(fond){
			this.style.color = "red";
			fond = false;
		}
		else{
			this.style.color = "gray";
			fond = true;
		}
	}
}

// 根据歌曲播放进度实时显示时间
function timeshow(player){
	var progressbar = document.getElementById("progressbar");
	var timediv = progressbar.getElementsByTagName("div")[0];
	setInterval(function(){
		var nowTime = Math.ceil(player.currentTime);
		var nowMin = parseInt(nowTime/60);
		var nowSec = nowTime%60;
		if(nowSec<10){
			nowSec = "0"+nowSec;
		}
		playtime.innerHTML = '';
		playtime.innerHTML = nowMin+":"+nowSec;
		timediv.style.width = player.currentTime/player.duration*100+"%";
	},300);
	
}


//点击或拖动进度条
function timecontrol(player,event){
	var progressbar = document.getElementById("progressbar");
	var timediv = progressbar.getElementsByTagName("div")[0];
	
	progressbar.addEventListener("mousedown",function (event){
		// var timespan = progressbar.getElementsByTagName('span')[0];

		document.onmousemove = function(event){
			// width的单位是px，所以需要用parseInt将数值取出来
			var timeMove = player.duration*((event.clientX-progressbar.offsetLeft)/parseInt(progressbar.style.width));
			// alert(timeMove);
			player.currentTime = timeMove;
			timediv.style.width = player.currentTime/player.duration*100+"%";
		}

		document.onmouseup=function (){
			document.onmousemove=null;
			document.onmouseup=null;
		};
	});

	progressbar.onmouseover = function(event){
		progressbar.onclick = function(event){
			var timeMove = player.duration*((event.clientX-progressbar.offsetLeft)/parseInt(progressbar.style.width));
			player.currentTime = timeMove;
			timediv.style.width = player.currentTime/player.duration*100+"%";
			// document.onclick = null;
		};

	};

}

// 音量控制
function voicecontrol(player,event){
	var voice = document.getElementById('sound');
	var voiceDiv = voice.getElementsByTagName('div')[0];

	voice.onmousedown = function(event){
		document.onmousemove = function(event){
			if (event.clientX>voice.offsetLeft && event.clientX<voice.offsetLeft+parseInt(voice.style.width)) {
				player.volume = (event.clientX-voice.offsetLeft)/parseInt(voice.style.width);
				voiceDiv.style.width = player.volume * parseInt(voice.style.width) + "px";			
			}
			// player.volume = player.volume*((event.clientX-voice.offsetLeft)/parseInt(voice.style.width));
			// voiceDiv.style.width = player.volume*100+"%";
		};

		document.onmouseup=function (){
			document.onmousemove=null;
			document.onmouseup=null;
		};
	};

	voice.onmouseover = function(event){
		voice.onclick = function(event){
			if (event.clientX>voice.offsetLeft && event.clientX<voice.offsetLeft+parseInt(voice.style.width)) {
				player.volume = (event.clientX-voice.offsetLeft)/parseInt(voice.style.width);
				voiceDiv.style.width = player.volume * parseInt(voice.style.width) + "px";			
			}
		};
	};
}


// 歌词显示部分，分为几个模块
// (1)从歌词文件中获取每个时间段的歌词
//（2）歌词随时间的滚动

// ajax获取歌词文件
function LyrControl(url,player){
	var ajaxData = null;

	if(window.XMLHttpRequest)
	{
		ajaxData = new XMLHttpRequest();
	}
	else
	{
		ajaxData = new ActiveXObject("Microsoft.XMLHTTP");
	}

	//2.连接服务器
	ajaxData.open('GET', url, true);
	
	//3.发送请求
	ajaxData.send();

	//4.接收服务器的返回
	ajaxData.onreadystatechange=function ()
	{
		if(ajaxData.readyState==4)	//完成
		{
			if(ajaxData.status==200)	//成功
			{
				var lyc = getLyc(ajaxData.responseText);
				lycShow(lyc,player);
			}
			else
			{
				console.log(ajaxData.status);
			}
		}
	};

}

// 对ajax获取的歌词文件进行处理
function getLyc(lyc){
	var reg = /<[^<>]+>/g;
	var lycTotal = lyc.replace(reg,'');
	var lycArray = lycTotal.split("/n");
	// alert(typeof(lycArray)); 
	var obj = {};  //将歌词信息，歌词和时间以对象的
	var value = [];
	for (var i = 0; i < lycArray.length; i++) {
		var regLycAll = /\[[0-9][0-9]\:[0-9][0-9]\.[0-9][0-9][0-9]\].*/g;//去掉前面几行没用的，取出歌词部分
		value = lycArray[i].match(regLycAll);
		// console.log(value)；
	};
	// alert(typeof(value));
	// console.log(value.length)
	for (var i = 0; i < value.length; i++) {
		var timereg = /\[[0-9][0-9]\:[0-9][0-9]\.[0-9][0-9][0-9]\]/g; //取出前面部分的时间
		var time = value[i].match(timereg);   //定义临时变量来存放每段歌词的时间
		// console.log(time)
		// console.log(typeof(time))
		var words = value[i].replace(timereg,"");//去掉前面的时间，取出歌词；replace也可以匹配正则表达式
		// console.log(words)
		var timew = time.toString()  //将对象转化成了字符串的格式
		// console.log(timew)
		var min = parseInt(timew.match(/[0-9][0-9]/)[0]);//获取时间的分
		// console.log(min)
		var sec = parseFloat(timew.match(/[0-9][0-9]\.[0-9][0-9][0-9]/));//获取时间的秒
		// console.log(sec)
		var trueTime = Math.round(min*60+sec);
		// console.log(trueTime)
		//console.log(words);
		obj[trueTime] = words;//将时间与对应的歌曲存放在一个对象中
	};
	// console.log(obj);
	return obj;
}

function lycShow(lyc,player){
	var lrcdiv = document.getElementById('lyric');
	var lrcul = lrcdiv.getElementsByTagName('ul')[0];
	var top = 0;	
	//console.log(lyc);
	for (t in lyc){
		var li = document.createElement("li");
		li.innerHTML = lyc[t];
		li.setAttribute('class','time'+t);
		lrcul.appendChild(li);
	}

	// var liFirst = lrcul.getElementsByTagName('li')[0];
	var liTotal = lrcul.getElementsByTagName('li');
	player.ontimeupdate = function (lyc){

		var time = Math.round(player.currentTime);
		
		var now = lrcdiv.getElementsByClassName('active')[0];
		var newtext = lrcdiv.getElementsByClassName('time'+time)[0];
		//console.log (now)
		if (newtext && newtext != now) {
			var reg = /active/;			
			newtext.className += ' active';  //加上后便是两个class属性
			//console.log(newtext)
			if (now) {
	    		now.className = now.className.replace(reg,'');
	    		console.log(now.clientHeight)
	    		top -= now.clientHeight;
	    		lrcul.style.top = 200+top+"px";
			}
		}
	}
}