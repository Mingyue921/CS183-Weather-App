import java.time.LocalDate;
import java.util.*;

public class finalApp {

   
    static final String[] TERM_NAMES = {
        "立春", "雨水", "惊蛰", "春分", "清明", "谷雨",
        "立夏", "小满", "芒种", "夏至", "小暑", "大暑",
        "立秋", "处暑", "白露", "秋分", "寒露", "霜降",
        "立冬", "小雪", "大雪", "冬至", "小寒", "大寒"
    };
    
    static final String[][] TERM_DATES = {
        {"02-04","02-17"}, {"02-18","03-04"}, {"03-05","03-19"},
        {"03-20","04-04"}, {"04-05","04-19"}, {"04-20","05-04"},
        {"05-05","05-20"}, {"05-21","06-04"}, {"06-05","06-20"},
        {"06-21","07-06"}, {"07-07","07-22"}, {"07-23","08-06"},
        {"08-07","08-22"}, {"08-23","09-06"}, {"09-07","09-22"},
        {"09-23","10-07"}, {"10-08","10-22"}, {"10-23","11-06"},
        {"11-07","11-21"}, {"11-22","12-06"}, {"12-07","12-21"},
        {"12-22","01-04"}, {"01-05","01-19"}, {"01-20","02-03"}
    };
    static final String[] TERM_CULTURE = {
        "打春牛，咬春，迎春接福。", "回娘家，拉保保，接寿迎福。",
        "吃梨避邪，蒙鼓皮，祭白虎。", "竖蛋，吃春菜，送春牛图。",
        "扫墓祭祖，踏青插柳，放风筝。", "谷雨贴，走百病。宜喝二月茶。",
        "立夏种人，祈求健康。", "祭车神，祈蚕节，食苦菜。",
        "送花神，安苗，煮梅。", "祭神祀祖，消夏避伏，吃夏至面。",
        "食新米，晒伏晒书画，赏荷。", "送大暑船，斗蟋蟀，饮伏茶。",
        "啃秋咬秋，贴秋膘，晒秋。", "祭祖迎秋，放河灯，开渔节。",
        "收清露，饮白露茶，啜米酒。", "祭月，吃秋菜，竖蛋，送秋牛。",
        "赏菊登高，饮菊花酒，吃芝麻。", "赏菊饮酒，吃柿子，进补。",
        "贺冬，补冬，迎冬祭祖。", "腌腊肉，吃糍粑，晒鱼干。",
        "观赏封河，进补，腌肉。", "祭祖贺冬，画九九消寒图，吃饺子。",
        "探梅赏冰，腊祭，备年货。", "尾牙祭，除旧布新，蒸消寒糕。"
    };
    static final String[] TERM_POETRY = {
        "竹外桃花三两枝，春江水暖鸭先知。", "好雨知时节，当春乃发生。",
        "微雨众卉新，一雷惊蛰始。", "春分雨脚落声微，柳岸斜风带客归。",
        "清明时节雨纷纷，路上行人欲断魂。", "清明断雪，谷雨断霜。",
        "绿树阴浓夏日长，楼台倒影入池塘。", "小满田塍寻草药，农闲莫问动三车。",
        "时雨及芒种，四野皆插秧。", "昼晷已云极，宵漏自此长。",
        "倏忽温风至，因循小暑来。", "赤日几时过，清风无处寻。",
        "秋风吹雨过南楼，一夜新凉是立秋。", "露蝉声咽霜林静，处暑初收白露团。",
        "露从今夜白，月是故乡明。", "秋分客尚在，竹露夕微微。",
        "露凝千片玉，菊散一丛金。", "霜降水返壑，风落木归山。",
        "冻笔新诗懒写，寒炉美酒时温。", "小雪晴沙不作泥，疏帘红日弄朝晖。",
        "大雪压青松，青松挺且直。", "天时人事日相催，冬至阳生春又来。",
        "小寒连大吕，欢鹊垒新巢。", "大寒雪未消，闭户不能出。"
    };
    static final String[] TERM_DIET = {
        "春饼、萝卜、韭菜", "龙须饼、罐罐肉、春笋", "梨、炒豆、鸡蛋",
        "春菜、汤圆、太阳糕", "青团、馓子、清明螺", "香椿、香菜、春笋",
        "立夏蛋、草莓、蚕豆", "苦菜、麦糕、枇杷", "青梅、君踏菜、芒种饼",
        "凉面、麦粽、夏至蛋", "藕、饺子、鳝鱼", "仙草、米糟、烧仙草",
        "西瓜、红烧肉、茄子", "鸭子、龙眼、酸梅汤", "米酒、番薯、白露茶",
        "秋菜、汤圆、桂花糕", "芝麻、菊花酒、大闸蟹", "柿子、牛肉、萝卜",
        "饺子、羊肉、甘蔗", "糍粑、腊肉、萝卜干", "红枣糕、羊肉���红薯粥",
        "饺子、汤圆、赤豆糯米饭", "腊八粥、糯米饭、菜饭", "消寒糕、八宝饭、年糕"
    };

    
    public static String[] findTerm(LocalDate date) {
        int cur = date.getMonthValue() * 100 + date.getDayOfMonth();
        for (int i = 0; i < TERM_DATES.length; i++) {
            String[] range = TERM_DATES[i];
            int start = toInt(range[0]);
            int end   = toInt(range[1]);
            if (start <= end) {
                if (cur >= start && cur <= end) {
                    return buildResult(i);
                }
            } else { // 跨年区间
                if (cur >= start || cur <= end) {
                    return buildResult(i);
                }
            }
        }
        return null; 
    }

    private static String[] buildResult(int index) {
        return new String[]{
            TERM_NAMES[index],
            TERM_CULTURE[index],
            TERM_POETRY[index],
            TERM_DIET[index]
        };
    }

    private static int toInt(String mmdd) {
        String[] p = mmdd.split("-");
        return Integer.parseInt(p[0]) * 100 + Integer.parseInt(p[1]);
    }

    
    public static void main(String[] args) {
       
        Map<String, String> frontendData = new LinkedHashMap<>();
        frontendData.put("temp", "20");
        frontendData.put("status", "Cloudy");
       
        String dateStr = "2026-04-20";  // 改为日期
        frontendData.put("date", dateStr);

        System.out.println("前端输入: " + frontendData);

        LocalDate date;
        try {
            date = LocalDate.parse(dateStr);
        } catch (Exception e) {
            date = LocalDate.now(); 
        }

        String[] termInfo = findTerm(date);
        System.out.println("匹配到的节气: " + (termInfo != null ? termInfo[0] : "未找到"));

        // 合并结果
        Map<String, Object> result = new LinkedHashMap<>(frontendData);
        if (termInfo != null) {
            Map<String, String> solarMap = new LinkedHashMap<>();
            solarMap.put("name", termInfo[0]);
            solarMap.put("culture", termInfo[1]);
            solarMap.put("poetry", termInfo[2]);
            solarMap.put("diet", termInfo[3]);
            result.put("solarTerm", solarMap);
        }

        System.out.println("返回给前端的完整数据: ");
        result.forEach((k, v) -> System.out.println(k + " : " + v));
    }
}