import csv

import streamlit as st
import pandas as pd
from scraper import scrape_ects, scrape_studies, scrape_trajects, scrape_years

print("Starting ECTS Scraper...")   

st.title("ECTS Vakken Scraper")

if "studies" not in st.session_state:
    st.session_state.studies = scrape_studies()

if "academicyears" not in st.session_state:
    st.session_state.academicyears = scrape_years()

studies = st.session_state.studies
academicyears = st.session_state.academicyears

# Set defaults
default_year = next((year for year in academicyears if "2025-26" in year), academicyears[0])
default_study = next((study for study in studies if "PBAGDM" in study), studies[0])

academicyear = st.selectbox(
    "Kies een academiejaar",
    academicyears,
    index=academicyears.index(default_year)
)
# Opties voor de gebruiker
study = st.selectbox(
    "Kies een opleiding",
    studies,
    index=studies.index(default_study)
)

if "stage" not in st.session_state:
    st.session_state.stage = "trajects"

if st.session_state.stage == "trajects":
    if st.button("Scrape trajects"):
        if "trajects" not in st.session_state:
            st.session_state.trajects = scrape_trajects(study, academicyear)
        st.session_state.stage = "vakken"
        st.rerun()

if st.session_state.stage == "vakken":
    st.write("Kies trajects:")
    
    # Select all checkbox
    col1, col2 = st.columns([0.1, 0.9])
    with col1:
        select_all = st.checkbox("Selecteer alles", key="select_all")
    
    selected_trajects = []
    for traject in st.session_state.trajects:
        col1, col2 = st.columns([0.1, 0.9])
        with col1:
            checkbox_value = select_all or st.checkbox(traject, key=traject, label_visibility="collapsed")
            if checkbox_value:
                selected_trajects.append(traject)
        with col2:
            st.caption(traject)
    
    if st.button("Scrape Vakken"):
        if selected_trajects:
            traject_names = [traject.split(" - ")[0] for traject in selected_trajects]
            with st.spinner("Bezig met scrapen..."):
                result = scrape_ects(study, academicyear, selected_trajects)
                df = pd.DataFrame(result)
                
                # Extract trajectory names and add as column
                
                print("Scrape resultaat:", df)  
                st.dataframe(df)
                
                # Create abbreviated filename
                unique_trajects = list(dict.fromkeys(traject_names))
                abbreviated = "-".join([f"{''.join([w[0].upper() for w in t.split()])}" for t in unique_trajects])
                filename = f"vakken-{academicyear.replace('/', '-')}-{abbreviated}.csv"

                st.download_button(
                    label="Download als CSV",
                    data=df.to_csv(index=False, quoting=csv.QUOTE_ALL, escapechar="\\").encode("utf-8"),
                    file_name=filename,
                    mime="text/csv"
                )
        else:
            st.warning("Selecteer minstens één traject")
