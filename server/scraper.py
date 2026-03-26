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
    soup = BeautifulSoup(html_content, "html.parser")

    def text(selector, attr=None):
        """Find one element, return stripped text or attribute value. Returns None if not found."""
        el = soup.select_one(selector)
        if not el:
            return None
        return el.get(attr, "").strip() if attr else el.get_text(strip=True)

    def label_next(label_text, next_tag="b"):
        """Find a span whose text starts with label_text, return the next <b> or <span>."""
        for span in soup.find_all("span", class_="DetailxOLODLabel"):
            if span.get_text(strip=True).startswith(label_text):
                sibling = span.find_next(next_tag)
                return sibling.get_text(strip=True) if sibling else None
        return None

    # ── Basic fields ──────────────────────────────────────────────────────

    course_name = text("#ctl00_ctl00_cphGeneral_cphMain_dStudiegidsTitle")

    academic_year = text("#ctl00_ctl00_cphGeneral_cphMain_lblAcademiejaarOmschrijving")

    # "Komt voor in" block — grab the first <b> inside the list item
    study_program = None
    komt_voor = soup.find("b", string=lambda s: s and "Bachelor" in s)
    if komt_voor:
        study_program = komt_voor.get_text(strip=True)

    # Trajectschijf — sits right after the program name as plain text
    trajectschijf = None
    if komt_voor:
        parent_text = komt_voor.parent.get_text(" ", strip=True)
        import re
        m = re.search(r"trajectschijf\s+(\d+)", parent_text, re.IGNORECASE)
        trajectschijf = m.group(1) if m else None

    study_load = text("#ctl00_ctl00_cphGeneral_cphMain_lblInhoudStudieomvang")

    total_study_time     = label_next("Totale studietijd",           next_tag="span")
    evaluation_deadline  = label_next("Mogelijke grensdata",         next_tag="b")
    grading_scale        = label_next("Dit opleidingsonderdeel wordt gequoteerd", next_tag="b")
    second_exam          = label_next("Tweede examenkans",           next_tag="b")
    teachers             = label_next("Docenten",                    next_tag="span")
    language             = label_next("Onderwijstalen",              next_tag="span")
    specific_study_program = soup.find("div", string=lambda s: s and "Keuzeoptie:" in s) is not None
    # Calendar — sometimes there are multiple (e.g., "Semester 5" or "Semester 6"), grab the last one
    calendar = None
    calendar = label_next("Kalender:", next_tag="span")
    print(f"Debug: Raw calendar value for '{course_name}': {calendar}")
    if calendar and ("Semester 5" in calendar and "Semester 6" in calendar):
        calendar = "Semester 6"
    elif calendar:
        match = re.search(r'Semester\s+(\d+)', calendar)
        if match:
            calendar = match.group(1)
   

    # Distribution of choice courses (keuzevak) across semesters
    if "keuzevak" in (course_name or "").lower():
        match = re.search(r'\d+', course_name)
        if match:
            calendar = match.group(0)
    # ── Learning outcomes ─────────────────────────────────────────────────

    learning_outcomes = []
    lo_table = soup.find("table", class_="table-bordered")
    if lo_table:
        for row in lo_table.find_all("tr")[1:]:   # skip header
            cols = row.find_all("td")
            if len(cols) >= 4:
                learning_outcomes.append({
                    "code":        cols[0].get_text(strip=True),
                    "description": cols[1].get_text(strip=True),
                    "level":       cols[2].get_text(strip=True),
                    "category":    cols[3].get_text(strip=True),
                })

    # ── Course content (free-text section) ───────────────────────────────
    # The "Omschrijving Inhoud" section is a <h4> followed by free HTML
    content_text = None
    inhoud_header = soup.find("h4", string=lambda s: s and "Inhoud" in s)
    if inhoud_header:
        parts = []
        for sibling in inhoud_header.find_next_siblings():
            # Stop at the next h4 section
            if sibling.name == "h4":
                break
            parts.append(sibling.get_text(" ", strip=True))
        content_text = "\n".join(p for p in parts if p)

    # ── Study materials ───────────────────────────────────────────────────
    # Each material is a <div class="ml-3"> containing a blue tag and a list
    study_materials = []
    materials_header = soup.find("h4", string=lambda s: s and "Studiematerialen" in s)
    if materials_header:
        for section in materials_header.find_next_siblings("div", class_="ml-3"):
            # Stop if we've moved past this section into the next h4 block
            if section.find_previous("h4") != materials_header:
                # Check we haven't crossed into the next section
                prev_h4 = section.find_previous("h4")
                if prev_h4 and "Studiematerialen" not in prev_h4.get_text():
                    break

            title_tag = section.find("span", class_="bold")
            badge_tag = section.find("span", class_="badge")
            remarks_tag = section.find("li", string=lambda s: s and "Opmerking" not in (s or ""))

            # Build detail lines from all <li> items
            details = [li.get_text(strip=True) for li in section.find_all("li")]

            # Extract "Opmerking:" from details list
            opmerking = None
            clean_details = []
            for d in details:
                if d.startswith("Opmerking:"):
                    opmerking = d.replace("Opmerking:", "").strip()
                else:
                    clean_details.append(d)

            study_materials.append({
                "title":    title_tag.get_text(strip=True) if title_tag else None,
                "required": badge_tag.get_text(strip=True) if badge_tag else None,
                "details":  clean_details,
                "remark":   opmerking,
            })

    # ── Teaching organisation ─────────────────────────────────────────────
    # Structure: category header (drawer.png img) → tag items (tag_blue.png img)
    teaching_org = []
    org_header = soup.find("h4", string=lambda s: s and "Onderwijsorganisatie (lijst)" in (s or ""))
    if org_header:
        current_category = None
        for sibling in org_header.find_next_siblings():
            if sibling.name == "h4":
                break
            if sibling.name == "div" and "ml-3" not in sibling.get("class", []):
                # Category label (contains the drawer image)
                if sibling.find("img", src=lambda s: s and "drawer" in s):
                    current_category = sibling.get_text(strip=True)
            if sibling.name == "div" and "ml-3" in sibling.get("class", []):
                title_tag = sibling.find("span", class_="bold") or sibling.find("span", class_="DetailxOLODTitel")
                badge_tag = sibling.find("span", class_="badge")
                teaching_org.append({
                    "category": current_category,
                    "title":    title_tag.get_text(strip=True) if title_tag else sibling.get_text(strip=True),
                    "hours":    badge_tag.get_text(strip=True) if badge_tag else None,
                })

    # Teaching org free text
    org_text_header = soup.find("h4", string=lambda s: s and "Onderwijsorganisatie (tekst)" in (s or ""))
    teaching_org_text = None
    if org_text_header:
        next_el = org_text_header.find_next_sibling()
        if next_el:
            teaching_org_text = next_el.get_text(" ", strip=True)

    # ── Evaluation ────────────────────────────────────────────────────────
    # Multiple titled blocks (eerste examenkans, tweede examenkans…)
    # Each block: <div class="DetailxOLODTitelEval"> + <table>
    evaluation = []
    for eval_header in soup.find_all("div", class_="DetailxOLODTitelEval"):
        title = eval_header.get_text(strip=True)
        eval_table = eval_header.find_next("table")
        if not eval_table:
            continue
        for row in eval_table.find_all("tr")[1:]:
            cols = row.find_all("td")
            if len(cols) >= 4:
                evaluation.append({
                    "exam_chance":  title,
                    "moment":       cols[0].get_text(strip=True),
                    "form":         cols[1].get_text(strip=True),
                    "percentage":   cols[2].get_text(strip=True),
                    "remark":       cols[3].get_text(strip=True),
                })

    # Evaluation free text
    eval_text_header = soup.find("h4", string=lambda s: s and "Evaluatie (tekst)" in (s or ""))
    evaluation_text = None
    if eval_text_header:
        next_el = eval_text_header.find_next_sibling()
        if next_el:
            evaluation_text = next_el.get_text(" ", strip=True)

    # ── Assemble ──────────────────────────────────────────────────────────
    return {
        "course_name":          course_name,
        "academic_year":        academic_year,
        "study_program":        study_program,
        "specific_study_program": specific_study_program,
        "trajectschijf":        trajectschijf,
        "study_load":           study_load,
        "total_study_time":     total_study_time,
        "evaluation_deadline":  evaluation_deadline,
        "grading_scale":        grading_scale,
        "second_exam":          second_exam,
        "teachers":             teachers,
        "language":             language,
        "calendar":             calendar,
        "content":              content_text,
        "learning_outcomes":    learning_outcomes,
        "study_materials":      study_materials,
        "teaching_org":         teaching_org,
        "teaching_org_text":    teaching_org_text,
        "evaluation":           evaluation,
        "evaluation_text":      evaluation_text,
    }

# def scrape_ects(study: str, academicYear: str, trajects: list):
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
            traject_page_url = link.get_attribute("href")
            driver.get(traject_page_url)

            
            time.sleep(1)
            print(f"Scraping course data for traject '{traject}'...")
            
            
            course_data = extract_course_data(driver.page_source)
            driver.switch_to.default_content()
            all_courses_data.append(course_data)

            time.sleep(1)

    driver.quit()
    return all_courses_data
def scrape_ects(study: str, academicYear: str, trajects: list):
    BASE = "https://ects.arteveldehogeschool.be"
    wait = WebDriverWait(driver, 10)

    select_jaar = Select(driver.find_element(By.ID, "ctl00_contentPlaceHolder_modelSearchOLODS_ddlAcademiejaar"))
    select_jaar.select_by_visible_text(academicYear)

    select_opleiding = Select(driver.find_element(By.ID, "ctl00_contentPlaceHolder_modelSearchOLODS_ddlOpleiding"))
    select_opleiding.select_by_visible_text(study)

    # Wait for traject dropdown to repopulate after opleiding postback
    wait.until(EC.presence_of_element_located((By.ID, "ctl00_contentPlaceHolder_modelSearchOLODS_ddlTraject")))

    all_courses_data = []

    for traject in trajects:
        select_traject = Select(driver.find_element(By.ID, "ctl00_contentPlaceHolder_modelSearchOLODS_ddlTraject"))
        try:
            select_traject.select_by_visible_text(traject)
        except Exception:
            driver.find_element(By.ID, "ctl00_contentPlaceHolder_Label1").click()
            time.sleep(1)
            select_traject = Select(driver.find_element(By.ID, "ctl00_contentPlaceHolder_modelSearchOLODS_ddlTraject"))
            select_traject.select_by_visible_text(traject)

        driver.find_element(By.ID, "ctl00_contentPlaceHolder_modelSearchOLODS_btnZoekOpleidingsonderdelen").click()
        time.sleep(3)

        # Collect all URLs first before any navigation — avoids stale element errors
        tables = driver.find_elements(By.CSS_SELECTOR, "#ctl00_contentPlaceHolder_treeViewOLODS_treeViewOpleidingsonderdelen table")

        urls = []
        for table in tables:
            try:
                link = table.find_element(By.CSS_SELECTOR, "a.fancybox.fancybox\\.iframe")
                href = link.get_attribute("href")
                if href:
                    full_url = href if href.startswith("http") else BASE + href
                    urls.append(full_url)
            except Exception:
                continue

        print(f"Traject '{traject}': {len(urls)} vakken gevonden")

        for i, url in enumerate(urls):
            print(f"  [{i+1}/{len(urls)}] {url}")
            try:
                driver.execute_script("window.open(arguments[0], '_blank');", url)
                driver.switch_to.window(driver.window_handles[-1])

                wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
                wait.until(EC.presence_of_element_located((By.ID, "ctl00_ctl00_cphGeneral_cphMain_dStudiegidsTitle")))
                course_data = extract_course_data(driver.page_source)
                course_data["traject"] = traject
                course_data["source_url"] = url
                all_courses_data.append(course_data)

            except Exception as e:
                print(f"    ⚠ Mislukt voor {url}: {e}")

            finally:
                driver.close()
                driver.switch_to.window(driver.window_handles[0])

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