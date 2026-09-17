window.employeeStomp = new WebSocketStomp('/stomp', 'employee', 36000);
window.employeeStomp.connect();

window.customerStomp = new WebSocketStomp('/stomp', 'customer', 36000);
window.customerStomp.connect();
