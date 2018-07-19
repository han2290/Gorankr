class CreatePlayers < ActiveRecord::Migration[5.0]
  def change
    create_table :players do |t|
      t.integer   "user_id"
      t.integer   "category_id"
      
      t.integer  "age"
      
      t.text     "game_data"
      t.boolean  "online"
      t.string   "game_type"
      t.timestamps
    end
  end
end
