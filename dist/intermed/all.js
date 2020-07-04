"use strict";

// function testConnection(url, update_cb) {
//     $.ajax({
//         url: url
//             + "?random-no-cache=" + Math.floor((1 + Math.random()) * 0x10000).toString(16)  // https://github.com/jdfreder/pingjs/blob/master/ping.js
//             + "?callback=foo", 
//         type: "HEAD",
//         dataType: "jsonp",
//         timeout: 1000
//     })
//     .always(function (dataOrjqXHR, textStatus, jqXHRorErrorThrown) {
//         console.log(dataOrjqXHR.status, textStatus, url);
//         update_cb(dataOrjqXHR.status);
//     });
// };
function testConnection(url, cb) {
  var script = document.createElement('script');
  new Promise(function (resolve, reject) {
    script.src = url + "?random-no-cache=" + new Date().getTime().toString(36) + Math.floor((1 - Math.random()) * Math.pow(36, 8)).toString(36) + "?callback=whatsupFoo";
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  }).then(function (event) {
    console.dir(event);
    cb(true);
  }, function (event) {
    console.dir(event);
    cb(false);
  })["catch"](function (err) {
    console.dir(err);
    cb(false);
  })["finally"](function () {
    script.parentNode.removeChild(script);
  });
}

function newServerLine(serverURL, serverName) {
  // Append HTML from template to the bottom of #slbody; update ID
  var template = document.getElementById("template-server");
  var clonedServer = template.content.cloneNode(true);
  document.getElementById("slbody").appendChild(clonedServer);
  var newServer = document.getElementById("server0");
  newServer.removeAttribute("id");
  serverClickEvents(newServer); // let id = new Date().getTime().toString(36) + '-' + Math.floor(36**8 - Math.random() * (36**8)).toString(36);
  // Set server name and URL, if given

  if (serverName) {
    newServer.getElementsByClassName("input-name")[0].value = serverName;
  }

  if (serverURL) {
    newServer.getElementsByClassName("input-url")[0].value = serverURL;
    newServer.getElementsByClassName("server-save")[0].click();
  }
}

;

function serverClickEvents(server) {
  server.getElementsByClassName("server-status")[0].innerText = '\xa0';

  server.getElementsByClassName("server-remove")[0].onclick = function () {
    return server.parentNode.removeChild(server);
  };

  server.getElementsByClassName("server-save")[0].onclick = function () {
    return finalizeServer(server);
  };

  server.getElementsByClassName("server-test")[0].onclick = function () {
    return testServer(server);
  };
}

function finalizeServer(server) {
  var serverURL = server.getElementsByClassName("input-url")[0].value;
  var serverName = server.getElementsByClassName("input-name")[0].value;
  var serverStatus = server.getElementsByClassName("server-status")[0]; // Validate: ensure http(s)

  var httpPattern = new RegExp('^(https?:\\/\\/)');

  if (!httpPattern.test(serverURL)) {
    serverURL = "http://" + serverURL;
  } // Validate: ensure well-formed IP or domain


  var IPPattern = new RegExp('((\\d{1,3}\\.){3}\\d{1,3})');
  var domainPattern = new RegExp('(([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}');

  if (IPPattern.test(serverURL)) {
    serverName = "📌 " + serverName;
    server.classList.add("ip");
  } else if (domainPattern.test(serverURL)) {
    serverName = "🌍 " + serverName;
    server.classList.add("url");
  } else {
    serverStatus.innerText = "⚠️ Badly formed address!";
    serverStatus.classList.remove("hide-small");
    return;
  } // Validate: ensure trailing /


  if (serverURL[serverURL.length - 1] != "/") {
    serverURL += "/";
  } // Copy over to finalized spots


  server.getElementsByClassName("server-name")[0].innerText = serverName ? serverName : '\xa0';
  server.getElementsByClassName("server-url")[0].text = serverURL;
  server.getElementsByClassName("server-url")[0].href = serverURL; // Update class lists

  server.classList.replace("drafting", "finalized");
  serverStatus.classList.remove("hide-small");
  serverStatus.innerText = '\xa0';
}

;

function testServer(server) {
  var status = server.getElementsByClassName("server-status")[0];
  var statusIcon = server.getElementsByClassName("server-loading-ico")[0];
  status.innerText = '\xa0';
  statusIcon.classList.add("load");

  var cb = function cb(success) {
    // let success = statusCode == 200 || (server.classList.contains("ip") && statusCode == 0);
    if (success) {
      status.innerText = "Success!";
    } else {
      status.innerText = "Failed to connect.";
    }

    statusIcon.classList.remove("load");
  };

  testConnection(server.getElementsByClassName("server-url")[0].href, cb);
}

;

function testAllServers() {
  var btns = document.querySelectorAll(".server.finalized .server-test");
  btns.forEach(function (btn) {
    return btn.click();
  });
}

;
var servers = document.getElementsByClassName("server");
[].forEach.call(servers, serverClickEvents);
var searchParams = new URL(decodeURIComponent(window.location.href)).searchParams;

if (searchParams.toString().length == 0 && document.getElementsByClassName("server").length == 0) {
  searchParams = new URLSearchParams("Router=" + "&Network Device=" + "&Modem=" + "&DNS Resolution=https://1.1.1.1" + "&Example.com=https://example.com");
}

searchParams.forEach(newServerLine);