import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SolarTermMatcher {

    private static final List<SolarTerm> TERMS;

    static {
        try {
            // 从同目录下读取 solarTerms.json
            String content = Files.readString(Path.of("solarTerms.json"));
            TERMS = parseTerms(content);
        } catch (IOException e) {
            throw new RuntimeException("无法读取 solarTerms.json，请确认文件在程序同目录下", e);
        }
    }

    
    private static List<SolarTerm> parseTerms(String json) {
        List<SolarTerm> list = new ArrayList<>();
        json = json.trim();
        
        if (json.startsWith("[")) json = json.substring(1);
        if (json.endsWith("]")) json = json.substring(0, json.length() - 1);
        
        String[] parts = json.split("\\}\\s*\\{");
        for (int i = 0; i < parts.length; i++) {
            String obj = parts[i].trim();
            if (!obj.startsWith("{")) obj = "{" + obj;
            if (!obj.endsWith("}")) obj = obj + "}";
            list.add(parseObject(obj));
        }
        return list;
    }

    private static SolarTerm parseObject(String obj) {
        SolarTerm term = new SolarTerm();
        term.setName(extract(obj, "name"));
        term.setStartDate(extract(obj, "startDate"));
        term.setEndDate(extract(obj, "endDate"));
        term.setCulture(extract(obj, "culture"));
        term.setPoetry(extract(obj, "poetry"));
        term.setDiet(extract(obj, "diet"));
        return term;
    }

    private static String extract(String obj, String key) {
        Matcher m = Pattern.compile("\"" + key + "\"\\s*:\\s*\"([^\"]*)\"").matcher(obj);
        return m.find() ? m.group(1) : "";
    }

    
    public static Map<String, Object> attachSolarTerm(Map<String, Object> input) {
        LocalDate date = null;
        if (input.containsKey("date")) {
            try {
                date = LocalDate.parse(input.get("date").toString(),
                        DateTimeFormatter.ISO_LOCAL_DATE);
            } catch (DateTimeParseException ignored) {}
        }
        if (date == null) date = LocalDate.now();

        SolarTerm term = getTermByDate(date);
        if (term != null) {
            input.put("solarTerm", term);
        }
        return input;
    }

    
    public static SolarTerm getTermByDate(LocalDate date) {
        int cur = date.getMonthValue() * 100 + date.getDayOfMonth();
        for (SolarTerm term : TERMS) {
            int start = toInt(term.getStartDate());
            int end   = toInt(term.getEndDate());
            if (start <= end) {// 正常区间，例如 04-20 ~ 05-04
                if (cur >= start && cur <= end) return term;
            } else {
                
                if (cur >= start || cur <= end) return term;
            }
        }
        return null;
    }

    private static int toInt(String mmdd) {
        String[] p = mmdd.split("-");
        return Integer.parseInt(p[0]) * 100 + Integer.parseInt(p[1]);
    }

    
    public static int getTermCount() {
        return TERMS.size();
    }
}
