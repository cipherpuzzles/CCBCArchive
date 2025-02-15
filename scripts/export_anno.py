import os
import yaml
import pymysql
from mysql_const import MYSQL_CONST
from datetime import datetime

BASE_DIR = 'D:\MyWorks\ccbcarchive\ccbcarchive\public\ccbc15'

def read_from_db(sql):
    # 连接数据库
    dbconn = pymysql.connect(host=MYSQL_CONST['host'],
                             port=MYSQL_CONST['post'],
                             user=MYSQL_CONST['user'],
                             password=MYSQL_CONST['pass'],
                             db=MYSQL_CONST['db'], charset='utf8')
    
    cursor = dbconn.cursor()

    # 读取数据
    cursor.execute(sql)
    data = cursor.fetchall()
    cursor.close()
    dbconn.close()
    return data

def parse_announcement(row):
    # 解析公告数据
    announcement = {}
    announcement['id'] = row[0]
    announcement['create_time'] = row[1].strftime('%Y-%m-%d %H:%M:%S') if row[3] else None
    announcement['update_time'] = row[2].strftime('%Y-%m-%d %H:%M:%S') if row[4] else None
    announcement['content'] = row[3]
    return announcement

def convertto_timestamp(time):
    # 将输入的时间文本转换为时间戳
    if not time:
        return None
    try:
        dt = datetime.strptime(time, '%Y-%m-%d %H:%M:%S')
        return int(dt.timestamp() * 1000)
    except ValueError:
        return None

def convert_announcement(announcement):
    # 转换公告格式
    content = {}
    content['aid'] = announcement['id']
    content['content'] = announcement['content']
    content['create_time'] = convertto_timestamp(announcement['create_time'])
    content['update_time'] = convertto_timestamp(announcement['update_time'])
    return content

def start():
    # 读取数据库
    data = read_from_db('select * from announcement order by create_time asc')
    
    announcements_doc = {
        'type': 'announcements',
        'title': '公告存档 - CCBC15',
        'content': ["这是CCBC 15比赛期间的公告存档。"]
    }
    announcements = []
    for row in data:
        announcement = parse_announcement(row)
        print(f"Processing announcement {announcement['id']} ...")
        announcement_doc = convert_announcement(announcement)
        announcements.append(announcement_doc)

    announcements_doc['announcements'] = announcements

    # 写入文件
    output_file = os.path.join(BASE_DIR, 'announcements.yaml')
    with open(output_file, 'w', encoding='utf8') as f:
        yaml.dump(announcements_doc, f, allow_unicode=True)

if __name__ == '__main__':
    start()
