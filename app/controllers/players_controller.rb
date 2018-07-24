class PlayersController < ApplicationController
    before_action :filter_players, only: [:queue]
    after_action :queue, only: [:create]
    # 현재 큐를 돌리고 있는 게이머들을 관리하고 큐를 직접 잡아준다.
    
    # 큐에 들어갈 유저정보를 담아서 player 모델 데이터를 생성해준다
    def create
        Player.find_by_user_id(current_user.id).try(:destroy)

        @player = Player.new
        @player.user_id = current_user.id
        @player.age = current_user.age
        
        @player.category_id = params[:category_id]
        @player.team_queue = params[:team_queue]
        if @player.category.game_name == "lol"
            game_id = current_user.usersgames.find_by_category_id(Category.find_by_game_name("lol").id).user_nickname
            puts "---game_id----"
            puts game_id
            url = URI.encode("https://kr.api.riotgames.com/lol/summoner/v3/summoners/by-name/#{game_id}?api_key=#{ENV["LOL_API_KEY"]}")
            user_lol_info = RestClient.get(url)
            user_lol_info = JSON.parse(user_lol_info)
            summonerId = user_lol_info["id"]
            accountId = user_lol_info["accountId"]
            
            # AccountId를 이용해 솔랭 게임의 정보를 가져온다
            url = URI.encode("https://kr.api.riotgames.com/lol/match/v3/matchlists/by-account/#{accountId}?queue=420&api_key=#{ENV["LOL_API_KEY"]}")
            user_lol_matches = RestClient.get(url)
            user_lol_matches = JSON.parse(user_lol_matches)
            user_lanes = []
            user_lol_matches["matches"].each do |match|
                user_lanes.push(match["lane"])
            end
            user_lanes = Hash[user_lanes.group_by(&:itself).map {|k,v| [k, v.size] }]
            user_lanes = user_lanes.sort_by {|k, v| v}.reverse
            
            pos1 = user_lanes[0][0]
            pos2 = user_lanes[1][0]
            
            # SummonerId를 이용해 티어를 가져온다
            url = URI.encode("https://kr.api.riotgames.com/lol/league/v3/positions/by-summoner/#{summonerId}?api_key=#{ENV["LOL_API_KEY"]}")
            user_lol_league = RestClient.get(url)
            user_lol_league = JSON.parse(user_lol_league)
            
            tier = user_lol_league[0]["tier"] 
            rank = user_lol_league[0]["rank"]
            lp = user_lol_league[0]["leaguePoints"].to_i
            
            # 가져온 데이터를 전체 점수로 환산함
                
            tier_table = {
                "DIAMOND" => 2500,
                "PLATINUM" => 2000,
                "GOLD" => 1500,
                "SILVER" => 1000,
                "BRONZE" => 500,
            }
            
            mmr = 0
            if ["MASTER", "CHALLENGER"].include? tier
                mmr = 2500 + lp
            else
                mmr = tier_table[tier] - rank.length * 100 + lp
            end
            @player.game_data = {mmr: mmr, pos1: pos1}
        end
        
        if @player.category.game_name == "pubg"
            # PubG opgg 점수 크롤링 
            game_id = current_user.usersgames.find_by_category_id(Category.find_by_game_name("pubg").id).user_nickname
            mmrs = Array.new
            url = URI.encode("https://dak.gg/profile/" + game_id)
            page = Nokogiri::HTML(open(url))
            solo_mmr = page.xpath('//*[@id="profile"]/div[3]/div[1]/section[1]/div[1]/div[1]/div[2]/span[1]').text.tr(',','').to_i
            duo_mmr = page.xpath('//*[@id="profile"]/div[3]/div[1]/section[2]/div[1]/div[1]/div[2]/span[1]').text.tr(',','').to_i
            squad_mmr = page.xpath('//*[@id="profile"]/div[3]/div[1]/section[3]/div[1]/div[1]/div[2]/span[1]').text.tr(',','').to_i
            
            [solo_mmr, duo_mmr, squad_mmr].each do |score|
                if score != 0
                    mmrs.push(score)
                end
            end
            average_mmr = (mmrs.inject :+) / mmrs.length
            
            @player.game_data = {mmr: average_mmr }
        end
        
        if @player.category.game_name == "ow"
            game_id = current_user.usersgames.find_by_category_id(Category.find_by_game_name("ow").id).user_nickname
            # 오버와치 점수 가져오기
            url = URI.encode("https://www.overbuff.com/players/pc/" + game_id)
            page = Nokogiri::HTML(open(url))
            mmr = page.css("span .player-skill-rating").text
    
            # 오버와치 포지션 가져오기
            url = URI.encode("https://www.overbuff.com/players/pc/" + game_id + "?mode=competitive")
            page = Nokogiri::HTML(open(url))
            pos = page.xpath("/html/body/div[1]/div[3]/div/div[3]/div[2]/div[2]/div/section/article/table/tbody/tr[1]/td[1]/a/img").attr("alt")
            @player.game_data = {mmr: mmr, pos1: pos}
        end
        
        puts "create-------------------set"
        @player.save
    end
    
    def queue
        player = Player.find_by_user_id(current_user.id)
        if player.team_queue
            
            # Matching for team LOL
            if player.category_id == 1 
                team = [player]
                roles = [player.game_data[:pos1]]
                Player.where.not(user_id: player.user_id).where(category_id: Category.find_by_game_name("lol")).all.each do |other_player|
                    if (player.age - other_player.age).abs < 3 && other_player.category.game_name == "lol" && (player.game_data[:mmr].to_i - other_player.game_data[:mmr].to_i).abs < 200 && roles.exclude?(other_player.game_data[:pos1])
                            roles.push(other_player.game_data[:mmr])
                            team.push(other_player)
                    end
                    
                    if team.length == 5
                        channel_members = Array.new
                        team.each do |member|
                            channel_members.push(member.user.id)
                        end
                        team.each do |member|
                            matched_user = User.find(member.user_id)
                            Pusher.trigger("user_#{matched_user.id}", 'match', channel_members.as_json)
                        end
                    end
                end
            end
            
            # Matching for team PUBG
            if player.category_id == 3
                team = [player]
                Player.where.not(user_id: player.user_id).where(category_id: Category.find_by_game_name("pubg")).all.each do |other_player|
                    if (player.age - other_player.age).abs < 3 && other_player.category.game_name == "pubg" && (player.game_data[:mmr].to_i - other_player.game_data[:mmr].to_i).abs < 500 && team.length < 4
                        team.push(other_player)
                    end
                    if team.length == 4
                        channel_members = Array.new
                        team.each do |member|
                            channel_members.push(member.user.id)
                        end
                        team.each do |member|
                            matched_user = User.find(member.user_id)
                            Pusher.trigger("user_#{matched_user.id}", 'match', channel_members.as_json)
                        end
                    end
                end
            end
            
            if player.category_id == 2
                team = [player]
                roles = [player.game_data[:pos1]]
                Player.where.not(user_id: player.user_id).where(category_id: Category.find_by_game_name("ow")).all.each do |other_player|
                    if (player.age - other_player.age).abs < 3 && other_player.category.game_name == "ow" && (player.game_data[:mmr].to_i - other_player.game_data[:mmr].to_i).abs < 200 && roles.exclude?(other_player.game_data[:pos1])
                            roles.push(other_player.game_data[:mmr])
                            team.push(other_player)
                    end
                    if team.length == 4
                        channel_members = Array.new
                        team.each do |member|
                            channel_members.push(member.user.id)
                        end
                        team.each do |member|
                            matched_user = User.find(member.user_id)
                            Pusher.trigger("user_#{matched_user.id}", 'match', channel_members.as_json)
                        end
                    end
                end
            end
        else
            # 듀오 매칭 잡아주기
            duo = [player]
            Player.where.not(user_id: player.user.id).where(category_id: player.category.id).all.each do |other_player|
                if (player.age - other_player.age).abs > 3
                    next
                end
                if (player.game_data[:mmr] - other_player.game_data[:mmr]).abs > 250
                    next
                end
                duo.push(other_player)
                break
            end
            if duo.length == 2
                channel_members = Array.new
                duo.each do |member|
                    channel_members.push(member.user.id)
                end
                duo.each do |member|
                    matched_user = User.find(member.user_id)
                    Pusher.trigger("user_#{matched_user.id}", 'match', channel_members.as_json)
                end
            end
        end
    end
    
    # 플레이어의 시간을 업데이트해줌
    def update
        player = Player.find_by_user_id(current_user.id)
        player.touch unless player.nil?
    end
    
    def destroy
        Player.find_by_user_id(current_user.id).destroy
    end
    
    # 최근 업데이트 되지 않은 플레이어들은 다 삭제해 주기
    def filter_players
        Player.where(updated_at: 30.seconds.ago..Time.now).destroy_all
    end
    
    # 플레이어들을 채팅방에 연결해줌
    def link_players
        room_name =  params[:team].join('_')
        player = Player.find_by_user_id(current_user.id)
        # 플레이어들 넣어줄 채팅방 만들기
        puts "--------room_name----------"
        puts room_name
        if ChatRoom.where(title: room_name).empty?
            chat_room = ChatRoom.create(title: room_name, category_id: player.category_id)
            puts Admission.create(user_id: current_user.id, chat_room_id: chat_room.id)
            # sleep 2.2
            # Pusher.trigger("user_#{current_user.id}", 'link', {:id => @chat_room.id}.as_json )
            puts "----------------------Create Room--------------------------"
            # Pusher.trigger("chat_room_#{@chat_room.id}", 'reload', {})
        else
            chat_room = ChatRoom.find_by! title: room_name
            # 플레이어 어드미션 만들어주기
            puts Admission.create(user_id: current_user.id, chat_room_id: chat_room.id)
            # sleep 2.2
            # 여기다가 두 유저의 데이터를 보내는 건 어떤지?
            # 채팅방으로 리다이렉트 해주기
            # Pusher.trigger("user_#{current_user.id}", 'link', {:id => chat_room.id}.as_json )
            puts "----------------------Join Room--------------------------"
        end
        if chat_room.admissions.length == params[:team].size
            chat_room.admissions.each do |admission|
                Pusher.trigger("user_#{admission.user_id}", 'link', {:id => chat_room.id}.as_json )
            end
        end
        puts "---------link-----"
        puts params[:team].size
        puts "----------------"
        # 플레이어 정보 삭제
        player.destroy
    end
    
    # # 2인 큐를 잡아주는 알고리즘
    # def duo_match
    #     player = Player.find_by_user_id(current_user.id)
    #     duo = [player]
    #     Player.where.not(user_id: player.user.id).where(category_id: player.category.id).all.each do |other_player|
    #         if (player.age - other_player.age).abs > 3
    #             next
    #         end
    #         if (player.game_data[:mmr] - other_player.game_data[:mmr]).abs > 250
    #             next
    #         end
    #         duo.push(other_player)
    #         break
    #     end
    #     if duo.length == 2
    #         channel_members = Array.new
    #         duo.each do |member|
    #             channel_members.push(member.user.username)
    #         end
    #         duo.each do |member|
    #             matched_user = User.find(member.user_id)
    #             Pusher.trigger("user_#{matched_user.id}", 'match', channel_members.as_json)
    #         end
    #     end
    # end
    
    # # 롤 5인큐를 잡아주는 알고리즘
    # def team_match_lol
    #     player = Player.find(current_user.id)
    #     team = [player]
    #     roles = [player.game_data[:pos1]]
    #     Player.where.not(user_id: player.user_id).where(category_id: Category.find_by_game_name("lol")).all.each do |other_player|
    #         if (player.age - other_player.age).abs < 3 && other_player.category.game_name == "lol" && (player.game_data[:mmr].to_i - other_player.game_data[:mmr].to_i).abs < 200 && roles.exclude?(other_player.game_data[:pos1])
    #                 roles.push(other_player.game_data[:mmr])
    #                 team.push(other_player)
    #         end
    #     end
    #     if team.length == 5
    #         channel_members = Array.new
    #         team.each do |member|
    #             channel_members.push(member.user.username)
    #         end
    #         team.each do |member|
    #             matched_user = User.find(member.user_id)
    #             Pusher.trigger("user_#{matched_user.id}", 'match', channel_members.as_json)
    #         end
    #     end
    # end
    
    # 배그 4인큐를 잡아주는 알고리즘
    # def team_match_pubg
    #     player = Player.find(current_user.id)
    #     team = [player]
    #     Player.where(category_id: Category.find_by_game_name("pubg")).all.each do |other_player|
    #         if (player.age - other_player.age).abs < 3 && other_player.category.game_name == "pubg" && (player.game_data[:mmr].to_i - other_player.game_data[:mmr].to_i).abs < 200 && team.length < 4
    #             team.push(other_player)
    #         end
    #     end
    #     if team.length == 4
    #         channel_members = Array.new
    #         team.each do |member|
    #             channel_members.push(member.user.username)
    #         end
    #         team.each do |member|
    #             matched_user = User.find(member.user_id)
    #             Pusher.trigger("user_#{matched_user.id}", 'match', channel_members.as_json)
    #         end
    #     end
    # end
end
