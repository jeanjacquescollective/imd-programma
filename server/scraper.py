from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.firefox.service import Service
from webdriver_manager.firefox import GeckoDriverManager
from bs4 import BeautifulSoup
import pandas as pd
import time
from selenium.common.exceptions import StaleElementReferenceException, NoSuchElementException

driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()))
driver.get("https://ects.arteveldehogeschool.be/ahsownapp/ects/ECTSEasy.aspx")

def scrape_years():
    select_year = Select(driver.find_element(By.ID, "ctl00_contentPlaceHolder_modelSearchOLODS_ddlAcademiejaar"))
    academicyears = [option.text for option in select_year.options if option.text != "Kies een academiejaar"]
    return academicyears

def scrape_studies():
    select_study = Select(driver.find_element(By.ID, "ctl00_contentPlaceHolder_modelSearchOLODS_ddlOpleiding"))
    studies = [option.text for option in select_study.options if option.text != "Kies een opleiding"]
    return studies

def scrape_trajects(study: str, year: str):
    try:
        jaar_dropdown = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "ctl00_contentPlaceHolder_modelSearchOLODS_ddlAcademiejaar"))
        )
        select_jaar = Select(jaar_dropdown)
        select_jaar.select_by_visible_text(year)

        opleiding_dropdown = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "ctl00_contentPlaceHolder_modelSearchOLODS_ddlOpleiding"))
        )
        select_opleiding = Select(opleiding_dropdown)
        select_opleiding.select_by_visible_text(study)

        traject_dropdown = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "ctl00_contentPlaceHolder_modelSearchOLODS_ddlTraject"))
        )
        select_traject = Select(traject_dropdown)
        trajects = [option.text for option in select_traject.options if option.text != "Kies een traject"]

        return trajects

    except NoSuchElementException as e:
        print(f"Element not found: {e}")
        return []
    except StaleElementReferenceException as e:
        print(f"Element is stale: {e}. Retrying...")
        return scrape_trajects(study, year)
    except Exception as e:
        print(f"An error occurred: {e}")
        return []

def extract_course_data(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')

    # Extract course details
    course_name = soup.find('h2', id='ctl00_ctl00_cphGeneral_cphMain_dStudiegidsTitle').text.strip()
    academic_year = soup.find('b', id='ctl00_ctl00_cphGeneral_cphMain_lblAcademiejaarOmschrijving').text.strip()
    study_program = soup.find('b', text='Bachelor in de grafische en digitale media').parent.text.strip()
    study_load = soup.find('span', id='ctl00_ctl00_cphGeneral_cphMain_lblInhoudStudieomvang').text.strip()
    total_study_time = soup.find('span', class_='DetailxOLODLabel', string='Totale studietijd: ').find_next('span').text.strip()
    evaluation_deadline = soup.find('span', class_='DetailxOLODLabel', string='Mogelijke grensdata voor leerkrediet: ').find_next('b').text.strip()
    grading_scale = soup.find('span', class_='DetailxOLODLabel', string='Dit opleidingsonderdeel wordt gequoteerd ').find_next('b').text.strip()
    second_exam_opportunity = soup.find('span', class_='DetailxOLODLabel', string='Tweede examenkans: ').find_next('b').text.strip()
    teachers = soup.find('span', class_='DetailxOLODLabel', string='Docenten: ').find_next('span').text.strip()
    language = soup.find('span', class_='DetailxOLODLabel', string='Onderwijstalen: ').find_next('span').text.strip()
    calendar = soup.find('span', class_='DetailxOLODLabel', string='Kalender: ').find_next('strong').text.strip()

    # Extract learning outcomes
    learning_outcomes = []
    table = soup.find('table', class_='table-bordered')
    rows = table.find_all('tr')[1:]  # Skip header row
    for row in rows:
        cols = row.find_all('td')
        code = cols[0].text.strip()
        description = cols[1].text.strip()
        level = cols[2].text.strip()
        category = cols[3].text.strip()
        learning_outcomes.append({
            'Code': code,
            'Description': description,
            'Level': level,
            'Category': category
        })

    # Extract study materials
    study_materials = []
    material_sections = soup.find_all('div', class_='ml-3')
    for section in material_sections:
        title = section.find('span', class_='bold')
        if title:
            title = title.text.strip()
            required = section.find('span', class_='badge')
            if required:
                required = required.text.strip()
            details = section.find_all('li')
            detail_texts = [li.text.strip() for li in details]
            study_materials.append({
                'Title': title,
                'Required': required,
                'Details': detail_texts
            })

    # Extract teaching organization
    teaching_organization = []
    org_sections = soup.find_all('div', class_='ml-3')
    for section in org_sections:
        title = section.find('span', class_='bold')
        if title:
            title = title.text.strip()
            hours = section.find('span', class_='badge')
            if hours:
                hours = hours.text.strip()
            description = section.find('li', class_='small')
            if description:
                description = description.text.strip()
            teaching_organization.append({
                'Title': title,
                'Hours': hours,
                'Description': description
            })

    # Extract evaluation
    evaluation = []
    eval_tables = soup.find_all('div', class_='DetailxOLODTitelEval')
    for table in eval_tables:
        title = table.find('span')
        if title:
            title = title.text.strip()
            eval_table = table.find_next('table')
            rows = eval_table.find_all('tr')[1:]  # Skip header row
            for row in rows:
                cols = row.find_all('td')
                moment = cols[0].text.strip()
                form = cols[1].text.strip()
                percentage = cols[2].text.strip()
                remark = cols[3].text.strip()
                evaluation.append({
                    'Title': title,
                    'Moment': moment,
                    'Form': form,
                    'Percentage': percentage,
                    'Remark': remark
                })

    # Create a dictionary to hold all data
    data = {
        'Course Name': course_name,
        'Academic Year': academic_year,
        'Study Program': study_program,
        'Study Load': study_load,
        'Total Study Time': total_study_time,
        'Evaluation Deadline': evaluation_deadline,
        'Grading Scale': grading_scale,
        'Second Exam Opportunity': second_exam_opportunity,
        'Teachers': teachers,
        'Language': language,
        'Calendar': calendar,
        'Learning Outcomes': learning_outcomes,
        'Study Materials': study_materials,
        'Teaching Organization': teaching_organization,
        'Evaluation': evaluation
    }

    return data

def scrape_ects(study: str, academicYear: str, trajects: list):
    select_jaar = Select(driver.find_element(By.ID, "ctl00_contentPlaceHolder_modelSearchOLODS_ddlAcademiejaar"))
    select_jaar.select_by_visible_text(academicYear)

    select_opleiding = Select(driver.find_element(By.ID, "ctl00_contentPlaceHolder_modelSearchOLODS_ddlOpleiding"))
    select_opleiding.select_by_visible_text(study)

    select_traject = Select(driver.find_element(By.ID, "ctl00_contentPlaceHolder_modelSearchOLODS_ddlTraject"))

    all_courses_data = []

    for traject in trajects:
        select_traject.select_by_visible_text(traject)
        driver.find_element(By.ID, "ctl00_contentPlaceHolder_modelSearchOLODS_btnZoekOpleidingsonderdelen").click()
        time.sleep(3)

        tables = driver.find_elements(By.CSS_SELECTOR, "#ctl00_contentPlaceHolder_treeViewOLODS_treeViewOpleidingsonderdelen table")
        for table in tables:
            link = table.find_element(By.CSS_SELECTOR, "a.fancybox")
            link.click()

            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".fancybox-iframe"))
            )
            time.sleep(1)
            print(f"Scraping course data for traject '{traject}'...")
            iframe = driver.find_element(By.CSS_SELECTOR, ".fancybox-iframe")
            driver.switch_to.frame(iframe)
            
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            course_data = extract_course_data(driver.page_source)
            driver.switch_to.default_content()
            all_courses_data.append(course_data)

            driver.find_element(By.CSS_SELECTOR, "button.close").click()
            time.sleep(1)

    driver.quit()
    return all_courses_data

if __name__ == "__main__":
    print("Starting scraper...")
    # studies = scrape_studies()
    # years = scrape_years()

    # study = "Interactive Media Development"
    # year = "2025-26"

    # if study in studies and year in years:
    #     trajects = scrape_trajects(study, year)
    #     courses_data = scrape_ects(study, year, trajects)

    #     # Convert to DataFrame and save as CSV
    #     df = pd.DataFrame(courses_data)
    #     df.to_csv('courses_data.csv', index=False)
    #     print("Data saved to courses_data.csv")
    # else:
    #     print(f"Study '{study}' or year '{year}' not found.")