var request = require('request'),
    qs = require('querystring'),
    OAuth = require('oauth').OAuth,
    settings = require('./settings'),
    oauth = new OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      settings.oauth.consumer_key,
      settings.oauth.consumer_secret,
      '1.0a',
      null,
      'HMAC-SHA1'
    );

function getUsers(eventId, callback) {
  var params = {
    format: 'json',
    event_id: eventId
  }
  var url = 'http://api.atnd.org/events/users/?' + qs.stringify(params);

  request({uri: url}, function(err, res, body) {
    if (err) throw err;
    if (res.statusCode !== 200) throw new Error('ATND API returns NG');
    
    var event = JSON.parse(body).events[0];
    event.users.forEach(function(element, index, array) {
      callback(event, element);
    });
  });
}

function update(message) {
  oauth.post(
    'http://api.twitter.com/1/statuses/update.json',
    settings.oauth.access_token,
    settings.oauth.access_token_secret,
    { status: message },
    function(err, data) {
      err && console.log(err);
    }
  );
}

getUsers(13529, function(event, user) {
  if (user.status === 1 && user.twitter_id) {
    update('@' + user.twitter_id + ' 本日は「' + event.title + '」の日です！あなたは参加人数にカウントされておりますので、もし参加できない場合は今すぐキャンセルをお願いします。お会いできるのを楽しみにしています！' + event.event_url);
  }
});
