public class SolarTerm {
    private String name;
    private String startDate;   // 格式 MM-DD
    private String endDate;
    private String culture;
    private String poetry;
    private String diet;

    
    public SolarTerm() {}

    // Getter 和 Setter
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getCulture() { return culture; }
    public void setCulture(String culture) { this.culture = culture; }

    public String getPoetry() { return poetry; }
    public void setPoetry(String poetry) { this.poetry = poetry; }

    public String getDiet() { return diet; }
    public void setDiet(String diet) { this.diet = diet; }
}
