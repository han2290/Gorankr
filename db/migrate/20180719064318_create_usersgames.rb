class CreateUsersgames < ActiveRecord::Migration[5.0]
  def change
    create_table :usersgames do |t|
      t.integer :user_id
      t.integer :category_id
      t.string  :user_nickname
      
      t.timestamps
    end
  end
end
