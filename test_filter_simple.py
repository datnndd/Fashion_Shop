import http.client
import json

def test(cid, name):
    conn = http.client.HTTPConnection("localhost", 8000)
    conn.request("GET", f"/catalog/products?category_id={cid}")
    resp = conn.getresponse()
    print(f"Status for {name} ({cid}): {resp.status}")
    if resp.status == 200:
        data = json.loads(resp.read().decode())
        print(f"Products: {len(data)}")
        for p in data:
            print(f" - {p['name']} (cat: {p['category_id']})")
    else:
        print(resp.read().decode())

if __name__ == "__main__":
    test(79, "Men")
    test(80, "Women")
    test(81, "Shirts")
