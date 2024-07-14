import re
from datetime import datetime

from util.logger import logging
import requests
from bs4 import BeautifulSoup

from investments.nps.npsHandler import NPSHandler


def getNPSDetails(fmCode, schemeCode):
    response = requests.get(
        f"https://www.npstrust.org.in/list-of-navy-graphs?navdata={fmCode}&subdata={schemeCode}&yearsel=60")
    soup = BeautifulSoup(response.text, 'html.parser')
    headers = [header.text.strip() for header in soup.find('tr').find_all('th')]
    rows = soup.find_all('tr')[1:]
    dataList = [{header: cell.text.strip().replace('\n', '') for header, cell in
                 zip(headers, row.find_all('td'))} for row in rows]
    response2 = requests.get(
        f"https://www.npstrust.org.in/nav-graphs-details?lnavdata={fmCode}&yearval=12&subcat={schemeCode}")
    pattern = r'[-+]?\d*\.\d+|[-+]?\d+'
    numbers = re.findall(pattern, response2.text)
    numbers = [float(num) for num in numbers]
    chartData = [numbers[i:i + 3] for i in range(0, len(numbers), 3)]
    dataList.append(chartData[-1][1])
    return dataList


class NPSService:
    Handler: NPSHandler

    def __init__(self, npsHandler: NPSHandler):
        self.Handler = npsHandler

    def fetchAllDeposits(self):
        return self.Handler.fetchAllNPS()

    def fetchNPSTransactions(self):
        return self.Handler.fetchTransactions()

    def insertNPS(self, schemeCode, fmCode, schemeName, investmentNAV, investmentQuant, purchaseDate):
        if investmentNAV < 0 or investmentQuant < 0:
            return False
        if purchaseDate == "":
            purchaseDate = datetime.now().strftime("%d/%m/%Y")
        return self.Handler.insertNPS(tuple([schemeCode, fmCode, schemeName, investmentNAV, investmentQuant,
                                             investmentQuant * investmentNAV]), purchaseDate)

    def sellNPS(self, soldQuant, soldNav, schemeCode, boughtNav, boughtQuant, sellDate, fmCode):
        if sellDate == "":
            sellDate = datetime.now().strftime("%d/%m/%Y")
        return self.Handler.sellNPS(soldQuant, soldNav, schemeCode, boughtNav, boughtQuant, sellDate, fmCode)

    def addNPS(self, addNav, addQuant, schemeCode, oldQuant, oldNav, buyDate, fmCode):
        if buyDate == "":
            buyDate = datetime.now().strftime("%d/%m/%Y")
        return self.Handler.addNPS(addNav, addQuant, schemeCode, oldQuant, oldNav, buyDate, fmCode)

    def refreshNPS(self):
        npsList = self.Handler.fetchOnlyNpsTable()
        schemeCodes = [nps[0] for nps in npsList]
        fmCode = [nps[1] for nps in npsList]
        dataList = [getNPSDetails(fmCode[index], schemeCodes[index])[0] for index in range(len(npsList))]
        for index, data in enumerate(dataList):
            if type(data[0]) != dict:
                logging.error("Error while fetching NPS details. Error in response")
                return False
            else:
                self.Handler.updateNPS(schemeCodes[index], data)
        return True
