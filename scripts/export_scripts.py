import os
import yaml
import pymysql
from mysql_const import MYSQL_CONST

BASE_DIR = 'D:\MyWorks\ccbcarchive\ccbcarchive\public\ccbc15'


def read_from_db(sql):
    # 连接数据库
    dbconn = pymysql.connect(host=MYSQL_CONST['host'],
                             port=MYSQL_CONST['port'],
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

def create_puzzle_page(psid, key, desc, script):
    puzzle_page = {
        'type': 'backend_script',
        'psid': psid,
        'title': desc,
        'key': key,
        'content': [f'服务器脚本 {key} {desc}'],
        'script': script
    }
    
    return puzzle_page

def ensure_dir_exists():
    if not os.path.exists(os.path.join(BASE_DIR, "scripts")):
        os.makedirs(os.path.join(BASE_DIR, "scripts"))

def export_mainlist():
    ensure_dir_exists()
    
    # 获取所有脚本
    scripts = read_from_db('SELECT `psid`, `key`, `desc`, `script` FROM puzzle_backend_script')
    
    # 为每个脚本生成YAML文件
    for scriptItem in scripts:
        psid, key, desc, script = scriptItem
        puzzle_page = create_puzzle_page(psid, key, desc, script)
        
        filename = f'{key}.yaml'
        with open(os.path.join(BASE_DIR, 'scripts', filename), 'w', encoding='utf8') as f:
            yaml.dump(puzzle_page, f, allow_unicode=True)

if __name__ == '__main__':
    export_mainlist()
