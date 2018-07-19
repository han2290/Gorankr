class CreateCategories < ActiveRecord::Migration[5.0]
  def change
    create_table :categories do |t|
      t.string :game_name
      t.string :game_full_name
      t.timestamps
    end
  end
end
