from manim import *

# Latest rendered revision: 2026-06-08
# If your editor still shows compare_versions(), reload this file from disk.


BG = "#111318"
FG = "#F4F1E8"
MUTED = "#C6CBD6"
BLUE = "#4EA5FF"
TEAL = "#2DD4BF"
GREEN = "#85D66B"
YELLOW = "#F5C542"
ORANGE = "#FF9F43"
RED = "#FF6B6B"
PURPLE = "#B084F5"

MANIM_TEXT = Text
TEXT_FONT = "Consolas"
CODE_FONT = "Consolas"


def _normalize_display_text(text):
    if not isinstance(text, str):
        return text
    return "\n".join(" ".join(line.split()) for line in text.split("\n"))


def Text(text, *args, font="", disable_ligatures=True, **kwargs):
    is_code = font == CODE_FONT
    display_text = text if is_code else _normalize_display_text(text)
    selected_font = CODE_FONT if is_code else TEXT_FONT
    return MANIM_TEXT(
        display_text,
        *args,
        font=selected_font,
        disable_ligatures=True,
        **kwargs,
    )


class WeatherAlgorithmVideo(Scene):
    def construct(self):
        self.camera.background_color = BG
        self.intro()
        self.overview()
        self.system_architecture()
        self.user_entry_points()
        self.backend_coordination()
        self.ai_advice_service()
        self.ending()

    def title(self, text, color=BLUE):
        title = Text(text, font_size=34, color=FG, weight=BOLD, font="Arial").to_edge(UP, buff=0.35)
        underline = Line(LEFT, RIGHT, color=color).set_width(title.width * 0.9)
        underline.next_to(title, DOWN, buff=0.12)
        return VGroup(title, underline)

    def card(self, text, width=2.6, height=1.05, color=BLUE, font_size=22):
        box = RoundedRectangle(
            width=width,
            height=height,
            corner_radius=0.14,
            stroke_color=color,
            stroke_width=3,
            fill_color=color,
            fill_opacity=0.18,
        )
        label = Text(text, font_size=font_size, color=FG, line_spacing=0.78, font="Arial").move_to(box)
        label.scale_to_fit_width(width * 0.8)
        if label.height > height * 0.64:
            label.scale_to_fit_height(height * 0.64)
        return VGroup(box, label)

    def paragraph(self, lines, width=11.2, height=2.35, color=BLUE, font_size=22):
        box = RoundedRectangle(
            width=width,
            height=height,
            corner_radius=0.18,
            stroke_color=color,
            stroke_width=3,
            fill_color=color,
            fill_opacity=0.12,
        )
        text = Text("\n".join(lines), font_size=font_size, color=FG, line_spacing=0.7, font="Arial")
        text.scale_to_fit_width(width * 0.9)
        if text.height > height * 0.78:
            text.scale_to_fit_height(height * 0.78)
        text.move_to(box)
        return VGroup(box, text)

    def formula_board(self, heading, lines, width=5.8, height=1.8, color=YELLOW, font_size=20):
        board = Rectangle(
            width=width,
            height=height,
            stroke_color=color,
            stroke_width=2.5,
            fill_color="#1A1D24",
            fill_opacity=0.88,
        )
        label = Text(heading, font_size=18, color=color, weight=BOLD, font="Arial")
        label.next_to(board.get_top(), DOWN, buff=0.16)

        body = VGroup(*[
            Text(line, font_size=font_size, color=FG, font="Consolas")
            for line in lines
        ]).arrange(DOWN, aligned_edge=LEFT, buff=0.12)
        body.scale_to_fit_width(width * 0.86)
        if body.height > height * 0.62:
            body.scale_to_fit_height(height * 0.62)
        body.next_to(label, DOWN, buff=0.18)
        body.align_to(board, LEFT).shift(RIGHT * 0.38)
        return VGroup(board, label, body)

    def arrow_between(self, left, right, color=MUTED):
        return Arrow(
            left.get_right(),
            right.get_left(),
            buff=0.18,
            color=color,
            stroke_width=4,
            max_tip_length_to_length_ratio=0.13,
        )

    def curved_link(self, start, end, color=MUTED, angle=0.0):
        return CurvedArrow(
            start,
            end,
            angle=angle,
            color=color,
            stroke_width=4,
            tip_length=0.18,
        )

    def packet(self, color=YELLOW):
        return Dot(radius=0.08, color=color).set_z_index(5)

    def clear(self):
        self.play(*[FadeOut(mob, shift=DOWN * 0.12) for mob in self.mobjects], run_time=0.75)

    def intro(self):
        title = VGroup(
            Text("Smart Weather", font_size=50, color=FG, weight=BOLD, font="Arial"),
            Text("Application", font_size=50, color=FG, weight=BOLD, font="Arial"),
        ).arrange(DOWN, buff=0.22, aligned_edge=ORIGIN)
        title.set_color_by_gradient(BLUE, TEAL, YELLOW)

        subtitle = Text(
            "Web + Mobile + Backend + AI Advice",
            font_size=26,
            color=MUTED,
            font="Arial",
        ).next_to(title, DOWN, buff=0.35)

        halo = Circle(radius=2.35, color=TEAL, stroke_opacity=0.35).move_to(title)
        ring = Circle(radius=2.78, color=PURPLE, stroke_opacity=0.25).move_to(title)
        orbit = Dot(radius=0.08, color=YELLOW).move_to(halo.point_at_angle(0))

        self.play(GrowFromCenter(halo), GrowFromCenter(ring), run_time=1)
        self.play(MoveAlongPath(orbit, halo), Write(title), run_time=1.4)
        self.play(
            FadeIn(subtitle, shift=UP * 0.25),
            halo.animate.scale(1.08),
            ring.animate.scale(0.94),
        )
        self.play(Rotate(halo, angle=PI / 4), Rotate(ring, angle=-PI / 5), run_time=0.8)
        self.wait(0.8)
        self.play(Circumscribe(title, color=YELLOW, time_width=0.8), Flash(orbit, color=YELLOW))
        self.wait(0.7)
        self.clear()

    def overview(self):
        heading = self.title("Overview", TEAL)
        self.play(FadeIn(heading, shift=DOWN * 0.2))

        center = self.card("Smart Weather\nApplication", width=3.2, height=1.05, color=GREEN, font_size=24)
        center.shift(UP * 1.25)

        parts = VGroup(
            self.card("React\nWeb App", width=2.45, height=0.92, color=BLUE, font_size=20),
            self.card("Expo\nMobile App", width=2.45, height=0.92, color=TEAL, font_size=20),
            self.card("Node.js\nExpress", width=2.45, height=0.92, color=ORANGE, font_size=20),
            self.card("AI Advice\nService", width=2.45, height=0.92, color=PURPLE, font_size=20),
        ).arrange(RIGHT, buff=0.35).shift(DOWN * 0.25)

        note_size = 17
        user_note = self.card("Web or mobile\nentry point", width=3.8, height=0.88, color=BLUE, font_size=note_size)
        backend_note = self.card("Backend coordinates\ndata requests", width=3.8, height=0.88, color=ORANGE, font_size=note_size)
        ai_note = self.card("AI generates\npractical advice", width=3.8, height=0.88, color=PURPLE, font_size=note_size)

        notes = VGroup(user_note, backend_note, ai_note).arrange(RIGHT, buff=0.28).move_to(DOWN * 2.0)
        arrows = VGroup(*[Arrow(center.get_bottom(), part.get_top(), buff=0.16, color=part[0].get_stroke_color(), stroke_width=3) for part in parts])

        self.play(GrowFromCenter(center), run_time=0.8)
        self.play(LaggedStart(*[FadeIn(part, shift=UP * 0.22) for part in parts], lag_ratio=0.12))
        self.play(LaggedStart(*[GrowArrow(arrow) for arrow in arrows], lag_ratio=0.08))
        self.play(LaggedStart(*[FadeIn(note, shift=UP * 0.2) for note in notes], lag_ratio=0.12))
        self.play(LaggedStart(*[Indicate(part, color=part[0].get_stroke_color()) for part in parts], lag_ratio=0.1))
        self.wait(2.2)
        self.clear()

    def system_architecture(self):
        heading = self.title("Part 2  Weather Data Processing", YELLOW)
        self.play(FadeIn(heading, shift=DOWN * 0.2))

        pipeline = VGroup(
            self.card("User\nInput", width=1.85, height=0.9, color=BLUE, font_size=18),
            self.card("City\nSearch", width=1.85, height=0.9, color=TEAL, font_size=18),
            self.card("API\nRequest", width=1.85, height=0.9, color=YELLOW, font_size=18),
            self.card("JSON\nResponse", width=2.0, height=0.9, color=ORANGE, font_size=18),
            self.card("Data\nParsing", width=1.95, height=0.9, color=PURPLE, font_size=18),
            self.card("Weather\nDashboard", width=2.25, height=0.9, color=GREEN, font_size=18),
        ).arrange(RIGHT, buff=0.16).shift(UP * 1.45)

        links = VGroup(*[
            self.arrow_between(pipeline[i], pipeline[i + 1], MUTED)
            for i in range(len(pipeline) - 1)
        ])

        packet = self.packet(YELLOW)
        path = VMobject()
        path.set_points_smoothly([step.get_center() for step in pipeline])

        self.play(LaggedStart(*[FadeIn(step, shift=UP * 0.2) for step in pipeline], lag_ratio=0.08))
        self.play(LaggedStart(*[GrowArrow(link) for link in links], lag_ratio=0.06))
        packet.move_to(pipeline[0])
        self.add(packet)
        self.play(MoveAlongPath(packet, path), run_time=1.6)
        self.play(Circumscribe(pipeline[4], color=PURPLE), Indicate(pipeline[-1], color=GREEN))
        self.wait(0.8)
        self.clear()

        heading = self.title("Part 2  Example: San Francisco", YELLOW)
        city = Text("San Francisco", font_size=34, color=FG, weight=BOLD, font="Arial").shift(UP * 1.75)
        pin = VGroup(
            Circle(radius=0.22, color=RED, fill_color=RED, fill_opacity=0.8),
            Triangle(color=RED, fill_color=RED, fill_opacity=0.8).scale(0.22).rotate(PI).shift(DOWN * 0.22),
        ).next_to(city, LEFT, buff=0.35)

        temp_icon = VGroup(
            Line(UP * 0.42, DOWN * 0.35, color=RED, stroke_width=7),
            Circle(radius=0.18, color=RED, fill_color=RED, fill_opacity=0.75).shift(DOWN * 0.48),
        )
        humidity_icon = VGroup(*[
            Circle(radius=0.08, color=BLUE, fill_color=BLUE, fill_opacity=0.8).shift(RIGHT * i * 0.22)
            for i in range(3)
        ])
        wind_icon = VGroup(
            Arrow(LEFT * 0.55, RIGHT * 0.55, color=TEAL, stroke_width=5, max_tip_length_to_length_ratio=0.18),
            Line(LEFT * 0.15 + UP * 0.18, RIGHT * 0.45 + UP * 0.18, color=TEAL, stroke_width=4),
            Line(LEFT * 0.35 + DOWN * 0.18, RIGHT * 0.25 + DOWN * 0.18, color=TEAL, stroke_width=4),
        )
        sun_icon = VGroup(
            Circle(radius=0.28, color=YELLOW, fill_color=YELLOW, fill_opacity=0.8),
            *[Line(ORIGIN, RIGHT * 0.48, color=YELLOW, stroke_width=3).rotate(i * PI / 4) for i in range(8)],
        )

        metrics = VGroup(
            VGroup(temp_icon, Text("22 C", font_size=28, color=FG, font="Arial")).arrange(DOWN, buff=0.22),
            VGroup(humidity_icon, Text("65%", font_size=28, color=FG, font="Arial")).arrange(DOWN, buff=0.28),
            VGroup(wind_icon, Text("3.2 m/s", font_size=28, color=FG, font="Arial")).arrange(DOWN, buff=0.2),
            VGroup(sun_icon, Text("Clear Sky", font_size=28, color=FG, font="Arial")).arrange(DOWN, buff=0.2),
        ).arrange(RIGHT, buff=1.0).shift(UP * 0.15)

        formula = Text("weather = parse_weather(JSON)", font_size=28, color=YELLOW, font="Consolas")
        fields = Text("T = 22 C    H = 65%    W = 3.2 m/s", font_size=25, color=GREEN, font="Consolas")
        VGroup(formula, fields).arrange(DOWN, buff=0.25).to_edge(DOWN, buff=0.55)

        self.play(FadeIn(heading, shift=DOWN * 0.2), FadeIn(pin, scale=0.7), Write(city))
        self.play(LaggedStart(*[GrowFromCenter(item[0]) for item in metrics], lag_ratio=0.12))
        self.play(LaggedStart(*[FadeIn(item[1], shift=UP * 0.15) for item in metrics], lag_ratio=0.12))
        self.play(Write(formula))
        self.play(TransformFromCopy(VGroup(*[item[1] for item in metrics[:3]]), fields), Circumscribe(fields, color=GREEN))
        self.wait(1.1)
        self.clear()

        heading = self.title("Part 2  Forecast Sampling", GREEN)
        timeline = VGroup(*[
            Dot(radius=0.055, color=MUTED if i % 8 else GREEN)
            for i in range(40)
        ]).arrange(RIGHT, buff=0.11).shift(UP * 0.45)
        selected = VGroup(*[timeline[i] for i in range(0, 40, 8)])
        day_cards = VGroup(*[
            self.card(f"Day {i + 1}", width=1.25, height=0.58, color=GREEN, font_size=16)
            for i in range(5)
        ]).arrange(RIGHT, buff=0.45).shift(DOWN * 1.2)
        sample_arrows = VGroup(*[
            Arrow(selected[i].get_bottom(), day_cards[i].get_top(), buff=0.12, color=GREEN, stroke_width=3)
            for i in range(5)
        ])
        formula_a = Text("records per day = 24 / 3 = 8", font_size=29, color=YELLOW, font="Consolas").shift(UP * 1.65)
        formula_b = Text("daily weather[i] = forecast[8 * i]", font_size=31, color=GREEN, font="Consolas").next_to(formula_a, DOWN, buff=0.25)

        self.play(FadeIn(heading, shift=DOWN * 0.2), Write(formula_a))
        self.play(TransformMatchingShapes(formula_a.copy(), formula_b))
        self.play(LaggedStart(*[FadeIn(dot, scale=0.7) for dot in timeline], lag_ratio=0.01), run_time=1.3)
        self.play(LaggedStart(*[Flash(dot, color=GREEN) for dot in selected], lag_ratio=0.08))
        self.play(LaggedStart(*[GrowArrow(a) for a in sample_arrows], lag_ratio=0.08), LaggedStart(*[FadeIn(card, shift=UP * 0.15) for card in day_cards], lag_ratio=0.08))
        self.wait(1.4)
        self.clear()

    def user_entry_points(self):
        heading = self.title("Part 3  Solar Term Matching", BLUE)
        self.play(FadeIn(heading, shift=DOWN * 0.2))

        flow_size = 19
        date = self.card("Current\nDate", width=2.35, height=0.95, color=BLUE, font_size=flow_size).shift(LEFT * 4.45 + UP * 1.15)
        convert = self.card("Date\nConversion", width=2.65, height=0.95, color=TEAL, font_size=flow_size).shift(LEFT * 1.55 + UP * 1.15)
        matcher = self.card("Solar Term\nMatcher", width=2.85, height=0.95, color=YELLOW, font_size=flow_size).shift(RIGHT * 1.55 + UP * 1.15)
        result = self.card("Current\nSolar Term", width=2.75, height=0.95, color=GREEN, font_size=flow_size).shift(RIGHT * 4.55 + UP * 1.15)

        knowledge = self.card("Cultural\nKnowledge Base", width=3.35, height=0.95, color=PURPLE, font_size=flow_size).shift(RIGHT * 4.55 + DOWN * 1.65)
        arrows = VGroup(
            self.arrow_between(date, convert, BLUE),
            self.arrow_between(convert, matcher, TEAL),
            self.arrow_between(matcher, result, YELLOW),
            Arrow(result.get_bottom(), knowledge.get_top(), buff=0.16, color=PURPLE, stroke_width=4),
        )

        culture = VGroup(
            self.card("Poems", width=1.8, height=0.72, color=BLUE, font_size=19),
            self.card("Customs", width=1.8, height=0.72, color=TEAL, font_size=19),
            self.card("Foods", width=1.8, height=0.72, color=ORANGE, font_size=19),
        ).arrange(RIGHT, buff=0.35).to_edge(DOWN, buff=0.35)

        self.play(FadeIn(date, shift=RIGHT * 0.25))
        self.play(FadeIn(convert, shift=RIGHT * 0.2), GrowArrow(arrows[0]))
        self.play(FadeIn(matcher, shift=RIGHT * 0.2), GrowArrow(arrows[1]))
        self.play(FadeIn(result, shift=RIGHT * 0.2), GrowArrow(arrows[2]))
        self.play(FadeIn(knowledge, shift=UP * 0.2), GrowArrow(arrows[3]))
        self.play(LaggedStart(*[FadeIn(item, shift=UP * 0.15) for item in culture], lag_ratio=0.12))
        self.play(Indicate(knowledge, color=PURPLE), run_time=1)
        self.wait(0.8)
        self.clear()

        heading = self.title("Part 3  Example: Grain Rain", BLUE)
        calendar = VGroup(
            Rectangle(width=2.2, height=1.55, stroke_color=BLUE, stroke_width=3, fill_color=BLUE, fill_opacity=0.14),
            Rectangle(width=2.2, height=0.42, stroke_color=BLUE, stroke_width=0, fill_color=BLUE, fill_opacity=0.45).shift(UP * 0.565),
            Text("2026-04-22", font_size=25, color=FG, font="Arial").shift(DOWN * 0.1),
        ).shift(LEFT * 3.9 + UP * 0.75)

        formula_1 = Text("date value = month * 100 + day", font_size=28, color=YELLOW, font="Consolas").shift(UP * 1.35 + RIGHT * 1.25)
        formula_2 = Text("4 * 100 + 22 = 422", font_size=34, color=GREEN, font="Consolas").next_to(formula_1, DOWN, buff=0.35)
        month_tag = Text("month = 4", font_size=22, color=BLUE, font="Consolas").next_to(calendar, DOWN, buff=0.35)
        day_tag = Text("day = 22", font_size=22, color=TEAL, font="Consolas").next_to(month_tag, DOWN, buff=0.18)

        number_line = NumberLine(
            x_range=[400, 520, 20],
            length=6.6,
            color=MUTED,
            include_numbers=False,
            tick_size=0.06,
        ).shift(DOWN * 1.1)
        number_labels = VGroup(*[
            Text(str(n), font_size=16, color=MUTED, font="Arial").next_to(number_line.n2p(n), DOWN, buff=0.12)
            for n in [400, 420, 440, 460, 480, 500, 520]
        ])
        marker_420 = Dot(number_line.n2p(420), color=YELLOW)
        marker_422 = Triangle(color=GREEN, fill_color=GREEN, fill_opacity=0.85).scale(0.16).rotate(PI).move_to(number_line.n2p(422) + UP * 0.35)
        marker_505 = Dot(number_line.n2p(505), color=YELLOW)
        range_line = Line(number_line.n2p(420), number_line.n2p(505), color=GREEN, stroke_width=7).shift(UP * 0.08)
        grain = Text("Grain Rain", font_size=30, color=GREEN, weight=BOLD, font="Arial").next_to(number_line, DOWN, buff=0.45)
        inequality = Text("420 <= 422 < 505", font_size=30, color=YELLOW, font="Consolas").next_to(grain, DOWN, buff=0.18)

        self.play(FadeIn(heading, shift=DOWN * 0.2), DrawBorderThenFill(calendar))
        self.play(FadeIn(month_tag, shift=UP * 0.1), FadeIn(day_tag, shift=UP * 0.1))
        self.play(Write(formula_1))
        self.play(TransformFromCopy(VGroup(month_tag, day_tag), formula_2))
        self.play(Create(number_line), FadeIn(number_labels), Create(range_line), FadeIn(marker_420), FadeIn(marker_505))
        self.play(FadeIn(marker_422, shift=DOWN * 0.2), Flash(marker_422, color=GREEN))
        self.play(Write(inequality), FadeIn(grain, shift=UP * 0.2), Circumscribe(grain, color=GREEN))
        self.wait(1.5)
        self.clear()

    def backend_coordination(self):
        heading = self.title("Part 4  Rule-Based Recommendation", ORANGE)
        self.play(FadeIn(heading, shift=DOWN * 0.2))

        rule_size = 20
        weather = self.card("Weather\nData", width=2.45, height=0.92, color=BLUE, font_size=rule_size).shift(LEFT * 4.25 + UP * 1.25)
        solar = self.card("Solar Term\nData", width=2.55, height=0.92, color=TEAL, font_size=rule_size).shift(LEFT * 4.25 + DOWN * 1.25)
        rules = self.card("Knowledge\nBase", width=2.75, height=1.0, color=YELLOW, font_size=rule_size).move_to(ORIGIN)
        recommendation = self.card("Fixed\nRecommendation", width=3.15, height=1.0, color=GREEN, font_size=rule_size).shift(RIGHT * 4.15)

        arrows = VGroup()
        arrows.add(self.arrow_between(weather, rules, BLUE))
        arrows.add(self.arrow_between(solar, rules, TEAL))
        arrows.add(self.arrow_between(rules, recommendation, GREEN))

        cloud = VGroup(
            Circle(radius=0.28, color=BLUE, fill_color=BLUE, fill_opacity=0.35).shift(LEFT * 0.3),
            Circle(radius=0.36, color=BLUE, fill_color=BLUE, fill_opacity=0.35),
            Circle(radius=0.25, color=BLUE, fill_color=BLUE, fill_opacity=0.35).shift(RIGHT * 0.34),
            Line(LEFT * 0.65, RIGHT * 0.65, color=BLUE, stroke_width=5).shift(DOWN * 0.28),
            *[Line(UP * 0.05, DOWN * 0.32, color=BLUE, stroke_width=3).shift(RIGHT * x + DOWN * 0.45) for x in [-0.32, 0, 0.32]],
        ).scale(0.72).shift(LEFT * 4.25 + DOWN * 2.0)
        rainy_label = Text("Rainy Weather", font_size=18, color=BLUE, font="Arial").next_to(cloud, DOWN, buff=0.14)

        leaf = VGroup(
            Ellipse(width=0.75, height=0.35, color=GREEN, fill_color=GREEN, fill_opacity=0.55).rotate(PI / 8),
            Line(LEFT * 0.3, RIGHT * 0.38, color=GREEN, stroke_width=3).rotate(PI / 8),
        ).scale(0.8).shift(LEFT * 1.45 + DOWN * 2.0)
        grain_label = Text("Grain Rain", font_size=18, color=GREEN, font="Arial").next_to(leaf, DOWN, buff=0.2)

        plus = Text("+", font_size=42, color=YELLOW, font="Arial").move_to((cloud.get_center() + leaf.get_center()) / 2)
        formula = Text("R = KB(Rainy, Grain Rain)", font_size=25, color=YELLOW, font="Consolas").shift(RIGHT * 2.55 + DOWN * 1.35)
        output_1 = Text("seasonal vegetables", font_size=20, color=GREEN, font="Arial")
        output_2 = Text("less outdoor time", font_size=20, color=GREEN, font="Arial")
        outputs = VGroup(output_1, output_2).arrange(DOWN, aligned_edge=LEFT, buff=0.16).next_to(formula, DOWN, buff=0.24)

        limitation = self.card("Same input\nalways gives\nsame output", width=3.0, height=1.15, color=RED, font_size=19)
        limitation.next_to(rules, UP, buff=0.75)
        pulse = Circle(radius=1.0, color=YELLOW, stroke_opacity=0.35).move_to(rules)

        self.play(GrowFromCenter(rules), GrowFromCenter(pulse))
        self.play(FadeIn(weather, shift=RIGHT * 0.25), FadeIn(solar, shift=RIGHT * 0.25))
        self.play(LaggedStart(*[GrowArrow(arrow) for arrow in arrows], lag_ratio=0.1))
        self.play(
            pulse.animate.scale(1.75).set_opacity(0),
            rules.animate.scale(1.06),
            rate_func=there_and_back,
            run_time=1.1,
        )
        self.play(FadeIn(recommendation, shift=LEFT * 0.25))
        self.play(FadeIn(limitation, shift=DOWN * 0.2), Circumscribe(limitation, color=RED))
        self.play(DrawBorderThenFill(cloud), FadeIn(rainy_label, shift=UP * 0.1))
        self.play(DrawBorderThenFill(leaf), FadeIn(grain_label, shift=UP * 0.1), Write(plus))
        self.play(Write(formula))
        self.play(FadeIn(outputs, shift=UP * 0.12), Circumscribe(outputs, color=GREEN))
        self.wait(1.5)
        self.clear()

    def ai_advice_service(self):
        heading = self.title("Part 5  AI Recommendation Algorithm", PURPLE)
        self.play(FadeIn(heading, shift=DOWN * 0.2))

        ai_input_size = 20
        weather = self.card("Weather\nData", width=2.55, height=0.9, color=BLUE, font_size=ai_input_size).shift(LEFT * 4.55 + UP * 1.65)
        solar = self.card("Solar Term\nData", width=2.65, height=0.9, color=TEAL, font_size=ai_input_size).shift(LEFT * 4.55)
        question = self.card("User\nQuestion", width=2.55, height=0.9, color=ORANGE, font_size=ai_input_size).shift(LEFT * 4.55 + DOWN * 1.65)
        ai = Circle(radius=1.0, color=PURPLE, stroke_width=4, fill_color=PURPLE, fill_opacity=0.18)
        ai_text = Text("LLM", font_size=32, color=FG, weight=BOLD, font="Arial").move_to(ai)
        ai_group = VGroup(ai, ai_text)
        advice = self.card("Personalized\nRecommendation", width=3.4, height=1.05, color=GREEN, font_size=ai_input_size).shift(RIGHT * 4.05)

        prompt = self.card("Structured\nPrompt", width=2.55, height=0.95, color=YELLOW, font_size=20).shift(LEFT * 1.85)
        formula = Text("prompt = f(weather, solar term, question)", font_size=25, color=YELLOW, font="Consolas")
        formula.to_edge(DOWN, buff=0.8)
        formula_2 = Text("advice = LLM(prompt)", font_size=27, color=GREEN, font="Consolas").next_to(formula, DOWN, buff=0.18)

        data_dots = VGroup(
            Dot(color=BLUE).move_to(weather.get_right()),
            Dot(color=TEAL).move_to(solar.get_right()),
            Dot(color=ORANGE).move_to(question.get_right()),
        )

        arrows = VGroup(
            self.arrow_between(weather, prompt, BLUE),
            self.arrow_between(solar, prompt, TEAL),
            self.arrow_between(question, prompt, ORANGE),
            self.arrow_between(prompt, ai_group, YELLOW),
            self.arrow_between(ai_group, advice, GREEN),
        )

        orbit = Circle(radius=1.34, color=PURPLE, stroke_opacity=0.28).move_to(ai)
        dot = Dot(radius=0.07, color=YELLOW).move_to(orbit.point_at_angle(0))

        self.play(FadeIn(weather, shift=RIGHT * 0.25), FadeIn(solar, shift=RIGHT * 0.25), FadeIn(question, shift=RIGHT * 0.25))
        self.play(FadeIn(prompt, scale=0.9), GrowArrow(arrows[0]), GrowArrow(arrows[1]), GrowArrow(arrows[2]))
        self.add(data_dots)
        self.play(
            data_dots[0].animate.move_to(prompt.get_left()),
            data_dots[1].animate.move_to(prompt.get_left() + DOWN * 0.08),
            data_dots[2].animate.move_to(prompt.get_left() + UP * 0.08),
            run_time=0.9,
        )
        self.play(Write(formula))
        self.play(GrowFromCenter(ai), Write(ai_text), Create(orbit))
        self.play(GrowArrow(arrows[3]), MoveAlongPath(dot, orbit), run_time=1.1)
        self.play(ai_group.animate.scale(1.14), Rotate(orbit, angle=PI), rate_func=there_and_back, run_time=0.9)
        self.play(FadeIn(advice, shift=LEFT * 0.25), GrowArrow(arrows[4]))
        self.play(Write(formula_2))
        self.play(Flash(advice, color=GREEN))
        self.wait(0.9)
        self.clear()

        heading = self.title("Part 5  Example: Personalized Advice", PURPLE)
        rainy = VGroup(
            Circle(radius=0.24, color=BLUE, fill_color=BLUE, fill_opacity=0.35).shift(LEFT * 0.24),
            Circle(radius=0.31, color=BLUE, fill_color=BLUE, fill_opacity=0.35),
            Circle(radius=0.22, color=BLUE, fill_color=BLUE, fill_opacity=0.35).shift(RIGHT * 0.28),
            Line(LEFT * 0.5, RIGHT * 0.5, color=BLUE, stroke_width=4).shift(DOWN * 0.25),
            *[Line(UP * 0.02, DOWN * 0.28, color=BLUE, stroke_width=3).shift(RIGHT * x + DOWN * 0.42) for x in [-0.25, 0, 0.25]],
            Text("Rainy", font_size=22, color=BLUE, font="Arial").shift(DOWN * 0.9),
        ).shift(LEFT * 4.65 + UP * 1.55)
        cold = VGroup(
            Line(UP * 0.36, DOWN * 0.32, color=TEAL, stroke_width=6),
            Circle(radius=0.16, color=TEAL, fill_color=TEAL, fill_opacity=0.75).shift(DOWN * 0.44),
            Text("5 C", font_size=24, color=FG, font="Arial").shift(DOWN * 0.9),
        ).shift(LEFT * 3.2 + UP * 1.55)
        winter_icon = VGroup(
            Circle(radius=0.45, color=YELLOW, stroke_width=3, fill_color=YELLOW, fill_opacity=0.12),
            *[Line(ORIGIN, UP * 0.34, color=YELLOW, stroke_width=3).rotate(a) for a in [0, PI / 3, 2 * PI / 3, PI, 4 * PI / 3, 5 * PI / 3]],
            Text("Winter\nSolstice", font_size=18, color=YELLOW, font="Arial").shift(DOWN * 0.95),
        ).shift(LEFT * 1.75 + UP * 1.55)
        question_icon = VGroup(
            Circle(radius=0.48, color=ORANGE, stroke_width=3, fill_color=ORANGE, fill_opacity=0.12),
            Text("?", font_size=44, color=ORANGE, weight=BOLD, font="Arial"),
            Text("clothing\nfood\ntravel", font_size=18, color=FG, font="Arial").shift(DOWN * 1.05),
        ).shift(LEFT * 0.3 + UP * 1.55)

        prompt_formula = Text("prompt = f(context, question)", font_size=24, color=YELLOW, font="Consolas").shift(DOWN * 0.15 + LEFT * 1.45)

        llm = VGroup(
            Circle(radius=0.72, color=PURPLE, stroke_width=4, fill_color=PURPLE, fill_opacity=0.16),
            Circle(radius=0.98, color=PURPLE, stroke_opacity=0.25),
            Text("LLM", font_size=28, color=FG, weight=BOLD, font="Arial"),
        ).shift(RIGHT * 3.55 + UP * 0.2)
        signal = Dot(radius=0.07, color=YELLOW).move_to(prompt_formula.get_right())
        prompt_to_llm = Arrow(prompt_formula.get_right(), llm.get_left(), buff=0.14, color=YELLOW, stroke_width=4)

        advice_formula = Text("advice = LLM(prompt)", font_size=27, color=GREEN, font="Consolas").shift(DOWN * 1.7 + LEFT * 1.55)
        output = Text(
            "1  thick coat\n2  hot ginger tea\n3  avoid long outdoor activity",
            font_size=19,
            color=GREEN,
            line_spacing=0.9,
            font="Consolas",
        ).shift(RIGHT * 3.4 + DOWN * 1.9)
        output_anchor = Dot(output.get_top() + UP * 0.28, radius=0.045, color=GREEN)
        llm_to_output = Arrow(llm.get_bottom(), output_anchor.get_center(), buff=0.24, color=GREEN, stroke_width=4)

        input_group = VGroup(rainy, cold, winter_icon, question_icon)
        prompt_hub = Dot(prompt_formula.get_top() + UP * 0.32, radius=0.055, color=YELLOW)
        arrow_starts = [
            rainy.get_center() + DOWN * 0.12,
            cold.get_center() + DOWN * 0.1,
            winter_icon.get_center() + DOWN * 0.14,
            question_icon.get_center() + DOWN * 0.12,
        ]
        input_tokens = VGroup(*[
            Dot(start, radius=0.065, color=color)
            for start, color in zip(arrow_starts, [BLUE, TEAL, YELLOW, ORANGE])
        ])

        self.play(FadeIn(heading, shift=DOWN * 0.2), LaggedStart(*[DrawBorderThenFill(item) for item in input_group], lag_ratio=0.1))
        self.play(FadeIn(prompt_hub, scale=0.7), LaggedStart(*[FadeIn(token, scale=0.8) for token in input_tokens], lag_ratio=0.08))
        self.play(
            *[token.animate.move_to(prompt_hub.get_center()) for token in input_tokens],
            Flash(prompt_hub, color=YELLOW),
            run_time=0.85,
        )
        self.play(FadeOut(input_tokens), FadeOut(prompt_hub), run_time=0.25)
        self.play(Write(prompt_formula), run_time=1.0)
        self.play(GrowArrow(prompt_to_llm), signal.animate.move_to(llm.get_center()), run_time=0.9)
        self.play(GrowFromCenter(llm), Rotate(llm[1], angle=PI), Flash(llm, color=PURPLE), run_time=1.1)
        self.play(TransformMatchingShapes(prompt_formula.copy(), advice_formula), GrowArrow(llm_to_output), FadeIn(output_anchor, scale=0.7))
        self.play(FadeIn(output, shift=UP * 0.15), Circumscribe(output, color=GREEN))
        self.wait(1.7)
        self.clear()

    def ending(self):
        heading = self.title("Part 6  Version Comparison", GREEN)
        self.play(FadeIn(heading, shift=DOWN * 0.2))

        v1 = self.card("Version 1\nFixed Rule Matching", width=3.65, height=0.85, color=ORANGE, font_size=20)
        v2 = self.card("Version 2\nAI Reasoning", width=3.65, height=0.85, color=PURPLE, font_size=20)
        VGroup(v1, v2).arrange(RIGHT, buff=1.75).shift(UP * 1.75)

        rule_engine = self.card("Rule Table", width=2.15, height=0.68, color=YELLOW, font_size=18)
        ai_engine = self.card("Large Language\nModel", width=2.25, height=0.78, color=PURPLE, font_size=18)
        rule_engine.move_to(LEFT * 3.25 + UP * 0.55)
        ai_engine.move_to(RIGHT * 3.25 + UP * 0.55)

        same_input = self.card("Same input\nRainy Weather", width=2.45, height=0.72, color=BLUE, font_size=17)
        same_input.move_to(LEFT * 3.25 + DOWN * 0.55)
        fixed_output = self.card("Same output\nCarry umbrella", width=2.55, height=0.72, color=GREEN, font_size=17)
        fixed_output.move_to(LEFT * 3.25 + DOWN * 2.0)

        cold_context = self.card("Rainy + 5 C", width=2.15, height=0.66, color=BLUE, font_size=18)
        warm_context = self.card("Rainy + 25 C", width=2.15, height=0.66, color=TEAL, font_size=18)
        cold_advice = self.card("Heavy coat", width=2.0, height=0.66, color=GREEN, font_size=18)
        warm_advice = self.card("Light jacket", width=2.0, height=0.66, color=YELLOW, font_size=18)

        ai_examples = VGroup(cold_context, warm_context).arrange(DOWN, buff=0.55)
        ai_results = VGroup(cold_advice, warm_advice).arrange(DOWN, buff=0.55)
        ai_examples.move_to(RIGHT * 2.45 + DOWN * 1.15)
        ai_results.next_to(ai_examples, RIGHT, buff=0.65)

        left_arrows = VGroup(
            Arrow(same_input.get_top(), rule_engine.get_bottom(), buff=0.15, color=YELLOW, stroke_width=4),
            Arrow(same_input.get_bottom(), fixed_output.get_top(), buff=0.12, color=GREEN, stroke_width=4),
        )
        right_arrows = VGroup(
            self.arrow_between(cold_context, cold_advice, GREEN),
            self.arrow_between(warm_context, warm_advice, YELLOW),
        )

        ai_arrow_1 = Arrow(ai_engine.get_bottom(), cold_context.get_top(), buff=0.14, color=PURPLE, stroke_width=4)
        ai_arrow_2 = Arrow(ai_engine.get_bottom(), warm_context.get_top(), buff=0.14, color=PURPLE, stroke_width=4)
        divider = DashedLine(UP * 2.45, DOWN * 2.45, color=MUTED, stroke_opacity=0.45)

        self.play(LaggedStart(FadeIn(v1, shift=RIGHT * 0.2), FadeIn(v2, shift=LEFT * 0.2), lag_ratio=0.2))
        self.play(Create(divider), FadeIn(rule_engine, shift=DOWN * 0.15), FadeIn(ai_engine, shift=DOWN * 0.15))
        self.play(FadeIn(same_input, shift=UP * 0.15), GrowArrow(left_arrows[0]))
        self.play(GrowArrow(left_arrows[1]), FadeIn(fixed_output, shift=UP * 0.15))
        self.play(Circumscribe(fixed_output, color=GREEN), Indicate(v1, color=ORANGE))
        self.play(
            LaggedStart(GrowArrow(ai_arrow_1), GrowArrow(ai_arrow_2), lag_ratio=0.15),
            LaggedStart(FadeIn(cold_context, shift=RIGHT * 0.15), FadeIn(warm_context, shift=RIGHT * 0.15), lag_ratio=0.15),
        )
        self.play(LaggedStart(GrowArrow(right_arrows[0]), GrowArrow(right_arrows[1]), lag_ratio=0.18))
        self.play(LaggedStart(FadeIn(cold_advice, shift=LEFT * 0.15), FadeIn(warm_advice, shift=LEFT * 0.15), lag_ratio=0.15))
        self.play(Circumscribe(ai_results, color=PURPLE), Indicate(v2, color=PURPLE))
        self.wait(1.6)
        self.play(*[FadeOut(mob, shift=DOWN * 0.12) for mob in self.mobjects])

        final_title = VGroup(
            Text("Smart Weather Application", font_size=44, color=FG, weight=BOLD, font="Arial"),
            Text("Algorithm Pipeline Summary", font_size=28, color=MUTED, font="Arial"),
        ).arrange(DOWN, buff=0.3)
        final_title.set_color_by_gradient(BLUE, TEAL, GREEN)
        final_title.move_to(UP * 1.2)

        final_points = VGroup(
            self.card("Weather Data\nProcessing", width=2.55, height=0.9, color=BLUE, font_size=18),
            self.card("Solar Term\nMatching", width=2.55, height=0.9, color=TEAL, font_size=18),
            self.card("AI-Powered\nRecommendations", width=2.75, height=0.9, color=PURPLE, font_size=18),
        ).arrange(RIGHT, buff=0.45).shift(DOWN * 0.45)

        thanks = Text("Thank you for watching", font_size=34, color=YELLOW, weight=BOLD, font="Arial")
        thanks.to_edge(DOWN, buff=0.65)

        ring = Circle(radius=2.75, color=GREEN, stroke_opacity=0.28).move_to(final_title)
        dot = Dot(radius=0.08, color=YELLOW).move_to(ring.point_at_angle(0))

        self.play(GrowFromCenter(ring), Write(final_title), run_time=1.1)
        self.play(LaggedStart(*[FadeIn(point, shift=UP * 0.18) for point in final_points], lag_ratio=0.12))
        self.play(MoveAlongPath(dot, ring), FadeIn(thanks, shift=UP * 0.18), run_time=1.5)
        self.play(Circumscribe(final_title, color=YELLOW))
        self.wait(2.0)
        self.play(FadeOut(final_title), FadeOut(final_points), FadeOut(thanks), FadeOut(ring), FadeOut(dot))
