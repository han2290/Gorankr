class CreatePosts < ActiveRecord::Migration[5.0]
  def change
    create_table :posts do |t|
      t.string :title
      t.string :username
      
      t.integer :view_count, default: 0
      
      
      t.string :content
      
      
      t.integer :user_id
      t.integer :category_id
      t.integer :impressions_count, :default => 0
      
      t.timestamps
    end
  end
end
