import streamlit as st
from scraper import scrape_ects, scrape_studies, scrape_trajects, scrape_years

st.title("ECTS Vakken Scraper")

if "studies" not in st.session_state:
    st.session_state.studies = scrape_studies()

if "academicyears" not in st.session_state:
    st.session_state.academicyears = scrape_years()

studies = st.session_state.studies
academicyears = st.session_state.academicyears

academicyear = st.selectbox(
    "Kies een academiejaar",
    academicyears
)
# Opties voor de gebruiker
study = st.selectbox(
    "Kies een opleiding",
    studies
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
    selected_trajects = []
    for traject in st.session_state.trajects:
        col1, col2 = st.columns([0.3, 0.7])
        with col1:
            if st.checkbox(traject, key=traject, label_visibility="collapsed"):
                selected_trajects.append(traject)
        with col2:
            st.caption(traject)
    
    if st.button("Scrape Vakken"):
        if selected_trajects:
            with st.spinner("Bezig met scrapen..."):
                df = scrape_ects(study, academicyear, selected_trajects)
                st.dataframe(df)
                st.download_button(
                    label="Download als CSV",
                    data=df.to_csv(index=False).encode("utf-8"),
                    file_name="vakken.csv",
                    mime="text/csv"
                )
        else:
            st.warning("Selecteer minstens één traject")

# if st.button("Scrape Vakken"):
#     with st.spinner("Bezig met scrapen..."):
#         df = scrape_ects(study, academicyear)
#         st.dataframe(df)
#         st.download_button(
#             label="Download als CSV",
#             data=df.to_csv(index=False).encode("utf-8"),
#             file_name="vakken.csv",
#             mime="text/csv"
#         )