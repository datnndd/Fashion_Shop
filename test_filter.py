import requests

def test():
    # Men (79)
    url = "http://localhost:8000/catalog/products?category_id=79"
    try:
        resp = requests.get(url)
        print(f"Status: {resp.status_code}")
        data = resp.json()
        print(f"Products for category 79 (Men): {len(data)}")
        for p in data:
            print(f" - {p['name']} (cat: {p['category_id']})")
            
        # Women (80)
        url = "http://localhost:8000/catalog/products?category_id=80"
        resp = requests.get(url)
        data = resp.json()
        print(f"Products for category 80 (Women): {len(data)}")
        for p in data:
            print(f" - {p['name']} (cat: {p['category_id']})")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test()
