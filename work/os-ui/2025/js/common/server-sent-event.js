/**
 * @callback callback
 * @return void
 */

/**
 * @callback event-callback
 * @param {MessageEvent} message
 * @return void
 */

/**
 * @callback error-callback
 * @param {Event} message
 * @return void
 */

class ServerSentEvent {
    /**
     *
     * @param {string} url
     */
    constructor(url) {
        this._url = url;
        this._onopen = () => {};
        this._onerror = () => {};
        this._onmessage = (event) => {};
        this._onclose = () => {};
        this._eventSource = null;
    }

    /**
     *
     * @param {callback} callback
     */
    set onopen(callback) { this._onopen = callback; }

    /**
     *
     * @param {error-callback} callback
     */
    set onerror(callback) { this._onerror = callback; }

    /**
     *
     * @param {event-callback} callback
     */
    set onmessage(callback) { this._onmessage = callback; }

    /**
     *
     * @param {callback} callback
     */
    set onclose(callback) { this._onclose = callback; }

    /**
     * connect sse
     * @throws NotSupportedException
     * @throws ConnectFailedException
     */
    connect() {
        if(window.EventSource == null) {
            throw new NotSupportedException();
        } else {
            try {
                this._eventSource = new EventSource(this._url);
                this._eventSource.onopen = this._onopen;
                this._eventSource.onerror = this._onerror;
                this._eventSource.onmessage = this._onmessage;
                this._eventSource.onclose = this._onclose;
            } catch (e) {
                throw new ConnectFailedException();
            }
        }
    }

    /**
     * disconnect sse
     */
    disconnect() {
        this._eventSource?.close();
    }
}