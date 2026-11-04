function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.indexOf("/api/") === 0) {
    return request;
  }

  if (uri.endsWith("/")) {
    request.uri = uri + "index.html";
  } else if (uri.indexOf(".") === -1) {
    request.uri = uri + "/index.html";
  }

  return request;
}
