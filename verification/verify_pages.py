import os
import time
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Set a standard desktop/laptop viewport
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()

        print("Acessando Dashboard...")
        page.goto("http://localhost:3000/")
        # Wait for the statistics to be populated/rendered
        page.wait_for_selector("text=Painel de Controle")
        time.sleep(1.5) # Allow page to fully render
        page.screenshot(path="verification/dashboard.png")
        print("Screenshot do Dashboard salvo em verification/dashboard.png")

        print("Acessando Nova OS...")
        page.goto("http://localhost:3000/os/nova")
        page.wait_for_selector("text=Problema / Queixa do Cliente")
        time.sleep(1.5)
        page.screenshot(path="verification/quick_os_form.png")
        print("Screenshot do Form de Abertura Rápida salvo em verification/quick_os_form.png")

        print("Acessando Detalhe de OS...")
        # Since we ran seed, OS-1003 or similar will be available in the database.
        # Let's find an OS card link from the OS list page to be extremely robust!
        page.goto("http://localhost:3000/os")
        page.wait_for_selector("text=OS-")
        time.sleep(1)

        # Click the first "Gerenciar" link/button to go to detail
        first_manage_btn = page.locator("text=Gerenciar").first
        first_manage_btn.click()

        # Wait for the OS details page to load
        page.wait_for_selector("text=Diagnóstico e Queixas Gerais")
        time.sleep(1.5)
        page.screenshot(path="verification/os_detail.png")
        print("Screenshot de Detalhe de OS salvo em verification/os_detail.png")

        browser.close()

if __name__ == "__main__":
    verify()
