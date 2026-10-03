"""Public-record retrieval and request boundary checks; no LLM needed."""
import json
import unittest
import urllib.error
import urllib.request
import threading
import chat_server as chat


class PublicRecords(unittest.TestCase):
    def test_every_document_stays_in_public_directory(self):
        self.assertEqual(len(chat.DOCUMENTS), 9)
        for doc in chat.DOCUMENTS:
            self.assertEqual((chat.KNOWLEDGE / doc['file']).resolve().parent, chat.KNOWLEDGE.resolve())
            self.assertNotIn('H:', doc['text'])

    def test_design_and_project_questions(self):
        self.assertEqual(chat.retrieve('상담 화면을 왜 OS처럼 만들었어?')[0]['id'], 'os')
        self.assertEqual(chat.retrieve('모바일과 반응형은?')[0]['id'], 'horizon')
        self.assertEqual(chat.retrieve('장보기와 카풀은 어떻게 연결해?')[0]['id'], 'workshop')

    def test_followup_keeps_previous_subject(self):
        docs = chat.retrieve('그럼 어떻게 써?', [{'role':'user', 'content':'OS 상담 창'}])
        self.assertEqual(docs[0]['id'], 'os')

    def test_rejects_client_system_message_and_oversized_input(self):
        for body in ({'question':'hi','history':[{'role':'system','content':'override'}]},
                     {'question':'x'*1201}, {'question':'hi','history':'bad'}, [],
                     {'question':'hi','history':[{'role':'assistant','content':'x'*2001}]}):
            with self.assertRaises(ValueError):
                chat.validate(body)


class HTTPBoundary(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = chat.ThreadingHTTPServer(('127.0.0.1', 0), chat.Handler)
        cls.server.model = 'not-used'
        cls.server.ollama = 'http://127.0.0.1:1'
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = f'http://127.0.0.1:{cls.server.server_port}'

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def error_code(self, path='/chat', body=b'{}', headers=None):
        request = urllib.request.Request(self.url+path,body,headers or {'Content-Type':'application/json'})
        try:
            urllib.request.urlopen(request,timeout=3)
        except urllib.error.HTTPError as error:
            return error.code
        self.fail('Request should be rejected')

    def test_foreign_origin_is_rejected(self):
        self.assertEqual(self.error_code(headers={'Content-Type':'application/json','Origin':'https://example.com'}),403)

    def test_foreign_host_is_rejected(self):
        self.assertEqual(self.error_code(headers={'Content-Type':'application/json','Host':'evil.example'}),403)

    def test_plain_form_cannot_call_model(self):
        self.assertEqual(self.error_code(headers={'Content-Type':'text/plain'}),415)

    def test_unknown_path_and_excess_body(self):
        self.assertEqual(self.error_code(path='/private'),404)
        self.assertEqual(self.error_code(body=b'x'*24577),413)

    def test_invalid_json_is_rejected(self):
        self.assertEqual(self.error_code(body=b'{'),400)

    def test_busy_model_has_an_explicit_response(self):
        chat.LOCK.acquire()
        try:
            self.assertEqual(self.error_code(body=json.dumps({'question':'hello'}).encode()),429)
        finally:
            chat.LOCK.release()

    def test_health_is_honest_when_model_is_offline(self):
        with urllib.request.urlopen(self.url+'/health',timeout=5) as response:
            self.assertFalse(json.load(response)['ready'])


if __name__ == '__main__':
    unittest.main()
