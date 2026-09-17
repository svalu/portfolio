class Exception extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class ConnectFailedException extends Exception {
    constructor() {
        super("연결 실패");
    }
}

class NotSupportedException extends Exception {
    constructor() {
        super("지원 하지 않음");
    }
}

class ServerException extends Exception {
    constructor() {
        super("서버 에러");
    }
}