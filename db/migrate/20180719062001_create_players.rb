class CreatePlayers < ActiveRecord::Migration[5.0]
  def change
    create_table :players do |t|
      t.integer :user_id
      t.integer :category_id
      
      t.integer :age
      t.text :game_data
      t.boolean :team_queue, default: false
      t.timestamps
    end
  end
end
