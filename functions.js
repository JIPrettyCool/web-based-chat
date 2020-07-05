document.getElementById('fileButton');
document.getElementById('fileUpload');
fileUpload.addEventListener('click', function(e) {
	e.preventDefault();
	fileButton.click();
});
var config = {
	apiKey: "AIzaSyCQS2Cu0saPXWPwdvCjT3F_W-nXVEK1JrU",
	authDomain: "sohbet-ji.firebaseapp.com",
	databaseURL: "https://sohbet-ji.firebaseio.com",
	projectId: "sohbet-ji",
	storageBucket: "sohbet-ji.appspot.com",
	messagingSenderId: "940167440280",
	appId: "1:940167440280:web:c96e20b7cca0af85f12ded"
};
firebase.initializeApp(config);
var uploader = document.getElementById('uploader');
var fileButton = document.getElementById('fileButton');
fileButton.addEventListener('change', function(e) {
	var file = e.target.files[0];
	var storageRef = firebase.storage().ref(file.name);
	var imageUrl = "<img height='500' src='https://firebasestorage.googleapis.com/v0/b/guest-web-chat.appspot.com/o/" + file.name + "?alt=media&token=65d365f6-571a-4fb7-892e-4eeaf6d90d1c'>";
	var videoUrl = "<video width='325' controls><source src='https://firebasestorage.googleapis.com/v0/b/guest-web-chat.appspot.com/o/" + file.name + "?alt=media&token=65d365f6-571a-4fb7-892e-4eeaf6d90d1c'></video>";
	var audioUrl = "<audio controls><source src='https://firebasestorage.googleapis.com/v0/b/guest-web-chat.appspot.com/o/" + file.name + "?alt=media&token=65d365f6-571a-4fb7-892e-4eeaf6d90d1c'></audio>";
	var undefinedUrl = "<div style='text-align: center; width: 150px; height: 80px;'>Bu dosya türü görüntülenemiyor !<br><a style='color:blue;'href='https://firebasestorage.googleapis.com/v0/b/guest-web-chat.appspot.com/o/" + file.name + "?alt=media&token=65d365f6-571a-4fb7-892e-4eeaf6d90d1c'target='__blank'>İNDİR</a></div>";
	switch(file.type) {
		case "image/jpeg":
		case "image/png":
		case "image/gif":
		case "image/x-icon":
		var mediaUrl = imageUrl;
		break;
		case "video/mp4":
		var mediaUrl = videoUrl;
		break;
		case "audio/mpeg":
		case "application/octet-stream":
		var mediaUrl = audioUrl;
		break;
		default:
		var mediaUrl = undefinedUrl;
	}
	var task = storageRef.put(file);
	$("#uploader").show();
	task.on('state_changed', function progress(snapshot) {
		uploader.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
		if(uploader.value == 100) {
			$("#uploader").hide();
			$(".alert").show();
			mediaSend();
			uploader.value = 0;
		}
	});
	function mediaSend() {
		var kadi = $("#kadi").val();
		if(kadi != "") {
			var date = new Date();
			var messageKey = firebase.database().ref("chat").push().key;
			firebase.database().ref("chat/" + messageKey).set({
				msgKey: messageKey,
				message: mediaUrl,
				from: kadi,
				hour: date.getHours(),
				minute: date.getMinutes()
			});
		}
	}
});
function clean() {
	firebase.database().ref("/").remove().key;
}
function registerMember() {
	var kadi = $("#kadi").val();
	if(kadi != "") {
		var date = new Date();
		var userKey = firebase.database().ref("user").push().key;
		firebase.database().ref("user/" + userKey).set({
			username: kadi,
			kulid: userKey,
			hour: date.getHours(),
			minute: date.getMinutes()
		});
		$("#loginScreen").hide();
		$("#chatScreen").show();
		uploadChat();
		uploadUser();
	} else {
		alert("Kullanıcı adını boş bırakmayın !");
	}
}
function sendMessage() {
	var msg = $("#msg").val();
	var kadi = $("#kadi").val();
	if(msg != "") {
		var date = new Date();
		var messageKey = firebase.database().ref("chat").push().key;
		firebase.database().ref("chat/" + messageKey).set({
			msgKey: messageKey,
			message: msg,
			from: kadi,
			hour: date.getHours(),
			minute: date.getMinutes()
		});
		$("#msg").val('');
	} else {
		alert("Lütfen boş bırakmayın !");
	}
}
function uploadChat() {
	var query = firebase.database().ref("chat");
	var kadi = $("#kadi").val();
	query.on('value', function(snapshot) {
		$("#messageArea").html("");
		snapshot.forEach(function(childSnapshot) {
			var data = childSnapshot.val();
			if(data.from == kadi) {
				var msg = `
				<div class="outgoingMessage">
				<div style="max-width: 350px;"><b>(` + data.from + `) </b>` + data.message + `<b> (` + data.hour + ` : ` + data.minute + `)</b></div>
				<span style="font-weight: normal; display: flex; align-items: center; margin-left: 5px; color: #fff; font-size: 20px;" onclick="firebase.database().ref('chat/` + data.msgKey + `').remove().key;""><i class="fa fa-remove"></i></span>			
				`;
				$("#messageArea").append(msg);
			} else {
				var msg = `
				<div class="incomingMessage">
				<div style="max-width: 350px;"><b>(` + data.from + `) </b>` + data.message + `<b> (` + data.hour + ` : ` + data.minute + `)</b></div>
				</div>
				`;
				$("#messageArea").append(msg);
			}
			$(".card-body").scrollTop($('.card-body')[0].scrollHeight - $('.card-body')[0].clientHeight);
		});
	});
}
function uploadUser() {
	var query = firebase.database().ref("user");
	query.on('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
			var data = childSnapshot.val(); {
				var msg = '<div style="float:left;">' + data.username + ' saat ' + data.hour + ':' + data.minute + '\'de aktifti.</div><br>';
				$("#modal-history").append(msg);
			}
		});
	});
}