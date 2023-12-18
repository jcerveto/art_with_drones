import requests 






url = 'https://0.0.0.0:6001'
cert_path = 'cert_registry.pem'
data = {'data': 'Informacion_para_el_POST'}

response = requests.get(url, verify=False)

print(response.text)
