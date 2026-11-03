# Builds category and question pages from _data/faq.yml without duplicating FAQ content.
module Jekyll
  class FaqPagesGenerator < Generator
    safe true
    priority :low

    def generate(site)
      faq_data = site.data["faq"] || {}
      categories = faq_data["categories"] || []
      questions = faq_data["questions"] || []
      source_records = (site.data["faq_sources"] || {})["sources"] || []

      categories.each do |category|
        slug = category["slug"].to_s
        next if slug.empty?

        category_questions = questions.select { |question| question["category"] == category["id"] }
        category_view = category.merge(
          "question_count" => category_questions.length,
          "answer_count" => category_questions.count { |question| !question["answer"].to_s.strip.empty? }
        )
        question_views = category_questions.map do |question|
          question.merge("page_url" => question_url(question))
        end

        permalink = "/faq/categories/#{slug}/"
        add_page(site, "faq/categories/#{slug}", permalink, {
          "layout" => "faq-category",
          "title" => "#{category['name']} - AI Knowledge Base",
          "description" => category["description"],
          "excerpt" => category["description"],
          "faq_category" => category_view,
          "faq_category_questions" => question_views
        })
      end

      question_lookup = questions.each_with_object({}) do |question, lookup|
        lookup[question["id"]] = question
      end

      questions.each do |question|
        category = categories.find { |item| item["id"] == question["category"] }
        next unless category

        status = question["status"].to_s
        answer = question["answer"].to_s.strip
        summary = answer.empty? ? "该问题已列入知识目录，答案仍在研究中。" : answer.gsub(/\s+/, " ")[0, 150]
        page_url = question_url(question)
        related = (question["related_questions"] || []).filter_map do |related_id|
          related_question = question_lookup[related_id]
          next unless related_question

          related_question.merge("page_url" => question_url(related_question))
        end

        add_page(site, "faq/questions/#{question['id']}", page_url, {
          "layout" => "faq-question",
          "title" => question["question"],
          "description" => summary,
          "excerpt" => summary,
          "noindex" => status != "published",
          "sitemap" => status == "published",
          "faq_question" => question,
          "faq_category" => category,
          "faq_sources" => source_records,
          "faq_related_questions" => related
        })
      end
    end

    private

    def question_url(question)
      "/faq/questions/#{question['id']}/"
    end

    def add_page(site, directory, permalink, data)
      if site.pages.any? { |page| page.url == permalink }
        Jekyll.logger.warn("FAQ page skipped:", "#{permalink} already exists")
        return
      end

      page = PageWithoutAFile.new(site, site.source, directory, "index.html")
      page.data.merge!(data)
      page.data["permalink"] = permalink
      page.content = ""
      site.pages << page
    end
  end
end
