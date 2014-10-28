Redmine::Plugin.register :redmine_wiki_templates do
	name 'Redmine Wiki Templates plugin'
	author 'Florent Solt'
	description 'Add wiki page thanks to a template'
	version '0.1.1'
	url 'https://github.com/florentsolt/redmine_wiki_templates'

	settings :default => {
		'templates' => [{
				:confirm => true,
				:label => "New page",
				:title => "",
				:content => ""
			},{
				:confirm => true,
				:label => "New todo",
				:title => "Todo",
				:content => "* {{todo}} Task 1 - {{user(admin)}}\n* {{done}} Task 2 - {{user(admin)}}\n* {{progress(50)}} Task 3 - {{user(admin)}}"
			},{
				:confirm => true,
				:label => "New meeting minutes",
				:title => "%year%-%month%-%day% Meeting minutes",
				:content => "Attendees:\n* \n\nAgenda:\n* \n\nMinutes:\n* "
			}].to_json,
		}, :partial => 'settings/wiki_templates'
end

class WikiTemplatesViewListener < ::Redmine::Hook::ViewListener
	# Adds javascript and stylesheet tags
	def view_layouts_base_html_head(context)
		javascript_include_tag("wiki_templates.js", :plugin => "redmine_wiki_templates") +
		"<script type='text/javascript'>wiki_templates_settings = #{Setting.plugin_redmine_wiki_templates['templates']};</script>".html_safe
	end
end

module WikiControllerPatch
	def self.included(base)
		base.send(:include, InstanceMethods)

		base.class_eval do
			alias_method_chain :edit, :template
		end
	end

	module InstanceMethods
		def edit_with_template
			edit_without_template

			if @page.new_record? and params.key? :text
				@text = @content.text += "\n\n" + params[:text]
			end
		end
	end
end

require_dependency "wiki_controller"
WikiController.send(:include, WikiControllerPatch)

Redmine::WikiFormatting::Macros.register do
	desc "Todo (to be done)"
	macro :todo do |obj, args|
		"<input type='checkbox' disabled='disabled'> ".html_safe
	end

	desc "Todo (completed)"
	macro :done do |obj, args|
		"<input type='checkbox' disabled='disabled' checked='checked'> ".html_safe
	end

	desc "Progress"
	macro :progress do |obj, args|
		"<progress value='#{args[0].to_i}' max='100'></progress> ".html_safe
	end

	desc "User avatar and link"
	macro :user do |obj, args|
		user = User.find_by_login(args[0].downcase.strip)
		if user.nil?
			args[0]
		else
			(avatar(user, :size => "14") + " " + link_to_user(user)).html_safe
		end
	end

	desc "Issue details (title & assignee)"
	macro :issue do |obj, args|
		issue = Issue.find(args[0].to_s.strip.to_i)
		if not issue.nil?
			user = issue.assigned_to
			text = "<div><a href='#{url_for(issue)}'><strong>##{issue.id}</strong> #{h issue.subject}</a>"
			" <em>to #{avatar(user, :size => "14")} #{link_to_user(user)} in</em>" if not user.nil?
			text += " <strong>#{issue.status}</strong></div>"
			text.html_safe
		else
			"<div>Issue #{h args[0].inspect} not found</div>".html_safe
		end
	end

	desc "Revision details (comments & author)"
	macro :revision do |obj, args|
		rev = Changeset.find_by_revision(args[0].to_s.strip.to_i)
		if not rev.nil?
			user = rev.user
			"<div><a href='#{url_for(:controller => 'repositories', :action => 'revision', :id =>  @project, :rev => rev.revision)}'><strong>r#{rev.revision}</strong> #{h truncate(rev.comments.gsub(/[\r\n]/, ' '), :length => 60)}</a> <em>by #{avatar(user, :size => "14")} #{link_to_user(user)}</em></div>".html_safe
		else
			"<div>Revision #{args[0].inspect} not found</div>".html_safe
		end
	end

end