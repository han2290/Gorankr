class CreateRecommends < ActiveRecord::Migration[5.0]
  def change
    create_table :recommends do |t|
      t.integer :user_id
      t.integer :user_id
      t.timestamps
    end
  end
end
