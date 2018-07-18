class Image < ApplicationRecord
    mount_uploader :image_path, ContentUploader
end
