import requests
from util.logger import logging

headers = {
    'Connection': 'close',
    'Cache-Control': 'max-age=0',
    'DNT': '1',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
                  'Chrome/79.0.3945.79 Safari/537.36',
    'Sec-Fetch-User': '?1',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,'
              'application/signed-exchange;v=b3;q=0.9',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-Mode': 'navigate',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
}

cookieFetcherHeader = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,'
              'application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cookie': 'defaultLang=en; _ga=GA1.1.1925057656.1697634521; '
              'RT="z=1&dm=nseindia.com&si=64070336-903a-4afb-aad0-201b7b1ccbe8&ss=lnyetu54&sl=1&se=8c&tt=6pu&bcn=%2F'
              '%2F684d0d4a.akstat.io%2F&ld=6qr&nu=fo902rjv&cl=bup&ul=6yb0&hd=6ybo"; '
              '_ga_PJSKY6CFJH=GS1.1.1697794204.2.1.1697794520.60.0.0',
    'Sec-Ch-Ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
}


def get_cookies_from_url():
    try:
        url = "https://www.nseindia.com/"  # Replace with your desired URL
        response = requests.get(url, headers=cookieFetcherHeader)
        return response.cookies
    except Exception as e:
        logging.info(f"Error: {e}")
        return None


def nseSymbolPurify(symbol):
    symbol = symbol.replace('&', '%26')  # URL Parse for Stocks Like M&M Finance
    return symbol


def nse_eq(symbol):
    symbol = nseSymbolPurify(symbol)
    try:
        payload = nseFetch('https://www.nseindia.com/api/quote-equity?symbol=' + symbol)
        try:
            if payload['error'] == {}:
                logging.info("Please use nse_fno() function to reduce latency.")
                payload = nseFetch('https://www.nseindia.com/api/quote-derivative?symbol=' + symbol)
        except:
            pass
        return payload
    except KeyError:
        logging.error("Getting Error While Fetching stocks price. Key Error")


def nseFetch(payload):
    cookies = get_cookies_from_url()
    headerCookies = ""
    for cookie in cookies:
        headerCookies += f"{cookie.name}={cookie.value};"
    if headers.get('Cookie') is not None:
        while headers['Cookie'] == headerCookies:
            cookies = get_cookies_from_url()
            logging.info("Generating new cookies.")
            headerCookies = ""
            for cookie in cookies:
                headerCookies += f"{cookie.name}={cookie.value};"
            headers['Cookie'] = headerCookies
    else:
        logging.info("Appended new cookie.")
        headers['Cookie'] = headerCookies
    output = requests.get(payload, headers=headers).json()
    return output
