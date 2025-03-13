const foundIPs = new Set();

function webRtcIp(onNewIP) {
    const peerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    const pc = new peerConnection({iceServers: [{urls: "stun:stun.l.google.com:19302"}]});
    const noop = () => {};
    const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g;

    function ipIterate(ip) {
        if (!foundIPs.has(ip) && ip !== '0.0.0.0') {
            foundIPs.add(ip);
            onNewIP(ip);
        }
    }

    pc.createDataChannel("");

    pc.createOffer((sdp) => {
        sdp.sdp.split('\n').forEach((line) => {
            if (line.indexOf('candidate') < 0) return;
            line.match(ipRegex)?.forEach(ipIterate);
        });
        pc.setLocalDescription(sdp, noop, noop);
    }, noop);

    pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
        ice.candidate.candidate.match(ipRegex)?.forEach(ipIterate);
    };
}

function addIP(ip) {
    console.log(ip)
}

webRtcIp(addIP);
