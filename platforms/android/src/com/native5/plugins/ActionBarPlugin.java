// Copyright (C) 2013 Native5 Software Solutions. 
//
// see LICENSE file for full definition.

package com.native5.plugins;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.LOG;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.annotation.TargetApi;
import android.app.ActionBar;
import android.app.Activity;
import android.app.FragmentTransaction;
import android.content.Context;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.util.DisplayMetrics;
import android.util.TypedValue;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.SubMenu;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.AbsListView;
import android.widget.BaseAdapter;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.SearchView;
import android.widget.SearchView.OnQueryTextListener;
import android.widget.SpinnerAdapter;
import android.widget.TextView;

/**
 * ! Native ActionBar/Menu plugin for Cordova/Android.
 * 
 * @author Barada Sahu
 * 
 *         Wraps the bare essentials of ActionBar and the options menu to
 *         appropriately populate the ActionBar in it's various forms.
 */
@TargetApi(Build.VERSION_CODES.ICE_CREAM_SANDWICH)
public class ActionBarPlugin extends CordovaPlugin {
	private static String TAG = "ActionBarPlugin";
	JSONArray menu_definition = null;
	Menu menu = null;
	HashMap<MenuItem, String> menu_callbacks = new HashMap<MenuItem, String>();

	HashMap<Integer, ActionBar.Tab> tabs = new HashMap<Integer, ActionBar.Tab>();
	HashMap<MenuItem, String> tab_callbacks = new HashMap<MenuItem, String>();
	String search_callback = null;

	// A set of base paths to check for relative paths from
	String bases[];

	class IconTextView extends LinearLayout {
		final ImageView Icon;
		final TextView Text;

		IconTextView(Context context, Drawable icon, String text) {
			super(context);
			Icon = new ImageView(context);
			Icon.setPadding(8, 8, 8, 8);
			Icon.setImageDrawable(icon);

			LayoutInflater inflater = LayoutInflater.from(context);
			Text = (TextView) inflater.inflate(
					android.R.layout.simple_spinner_dropdown_item, this, false);
			Text.setText(text);

			addView(Icon, new LayoutParams(LayoutParams.WRAP_CONTENT,
					LayoutParams.MATCH_PARENT));
			addView(Text);
		}
	}

	class NavigationAdapter extends BaseAdapter implements SpinnerAdapter {
		class Item {
			Drawable Icon = null;
			String Text = "";
		}

		final ActionBarPlugin plugin;
		ArrayList<Item> items = null;

		int listPreferredItemHeight = -1;

		class GetIconTask extends AsyncTask<String, Void, Drawable> {
			public final Item item;
			public Exception exception = null;

			GetIconTask(Item item) {
				this.item = item;
			}

			@Override
			protected Drawable doInBackground(String... uris) {
				return getDrawableForURI(uris[0]);
			}

			@Override
			protected void onPostExecute(Drawable icon) {
				if (icon != null) {
					item.Icon = icon;
				}
			}
		};

		NavigationAdapter(ActionBarPlugin plugin) {
			this.plugin = plugin;
		}

		public void setItems(JSONArray new_items) {
			if (new_items == null || new_items.length() == 0) {
				this.items = null;
				return;
			}

			final Activity ctx = (Activity) plugin.cordova;
			items = new ArrayList<Item>();

			for (int i = 0; i < new_items.length(); ++i) {
				try {
					JSONObject definition = new_items.getJSONObject(i);

					Item item = new Item();
					if (!definition.isNull("text"))
						item.Text = definition.getString("text");
					if (!definition.isNull("icon")) {
						new GetIconTask(item).execute(definition
								.getString("icon"));
					}

					items.add(item);
				} catch (JSONException e) {
					// Ignore,
				}
			}
		}

		@Override
		public int getCount() {
			return items == null ? 0 : items.size();
		}

		@Override
		public Object getItem(int position) {
			return items.get(position);
		}

		@Override
		public long getItemId(int position) {
			return position;
		}

		@Override
		public View getView(int position, View convertView, ViewGroup parent) {
			final Activity ctx = (Activity) plugin.cordova;
			LayoutInflater inflater = LayoutInflater.from(ctx.getActionBar()
					.getThemedContext());
			TextView view = (TextView) inflater.inflate(
					android.R.layout.simple_spinner_item, parent, false);
			view.setText(items.get(position).Text);
			return view;
		}

		@Override
		public View getDropDownView(int position, View convertView,
				ViewGroup parent) {
			final Activity ctx = (Activity) plugin.cordova;
			final Item item = items.get(position);

			IconTextView view;

			if (convertView instanceof IconTextView) {
				view = (IconTextView) convertView;
				view.Icon.setImageDrawable(item.Icon);
				view.Text.setText(item.Text);
			} else {
				view = new IconTextView(ctx.getActionBar().getThemedContext(),
						item.Icon, item.Text);
			}

			// Get preferred list height
			if (listPreferredItemHeight == -1) {
				DisplayMetrics metrics = new DisplayMetrics();
				ctx.getWindowManager().getDefaultDisplay().getMetrics(metrics);
				TypedValue value = new TypedValue();
				ctx.getTheme().resolveAttribute(
						android.R.attr.listPreferredItemHeight, value, true);
				listPreferredItemHeight = (int) value.getDimension(metrics);
			}

			view.setLayoutParams(new AbsListView.LayoutParams(
					AbsListView.LayoutParams.MATCH_PARENT,
					AbsListView.LayoutParams.WRAP_CONTENT));

			return view;
		}
	}

	NavigationAdapter navigation_adapter = new NavigationAdapter(this);

	ActionBar.OnNavigationListener navigation_listener = new ActionBar.OnNavigationListener() {
		@Override
		public boolean onNavigationItemSelected(int itemPosition, long itemId) {
			webView.sendJavascript("var item = window.plugins.navBar.navigation_items["
					+ itemPosition + "]; if(item.click) item.click();");
			return true;
		}
	};

	@Override
	public Object onMessage(String id, Object data) {

		if ("onCreateOptionsMenu".equals(id)
				|| "onPrepareOptionsMenu".equals(id)) {
			menu = (Menu) data;

			if (menu_definition != null
					&& menu.size() != menu_definition.length()) {
				menu.clear();
				menu_callbacks.clear();
				buildMenu(menu, menu_definition);
			}
		} else if ("onOptionsItemSelected".equals(id)) {
			MenuItem item = (MenuItem) data;
			if (item.getItemId() == android.R.id.home) {
				webView.sendJavascript("if(window.plugins.navBar.home_callback) window.plugins.navBar.home_callback();");
			} else if (menu_callbacks.containsKey(item)) {
				final String callback = menu_callbacks.get(item);
				webView.sendJavascript(callback);
			}
		}

		return null;
	}

	private String removeFilename(String path) {
		if (!path.endsWith("/")) {
			path = path.substring(0, path.lastIndexOf('/') + 1);
		}

		return path;
	}

	private Drawable getDrawableForURI(String uri_string) {
		Uri uri = Uri.parse(uri_string);
		Activity ctx = (Activity) cordova;

		// Special case - TrueType fonts
		if (uri_string.endsWith(".ttf")) {
			/*
			 * for(String base: bases) { String path = base + uri;
			 * 
			 * // TODO: Font load / glyph rendering
			 * ("/blah/fontawesome.ttf:\f1234") }
			 */
		}
		// General bitmap
		else {
			if (uri.isAbsolute()) {
				if (uri.getScheme().startsWith("http")) {
					try {
						URL url = new URL(uri_string);
						InputStream stream = url.openConnection()
								.getInputStream();
						return new BitmapDrawable(ctx.getResources(), stream);
					} catch (MalformedURLException e) {
						return null;
					} catch (IOException e) {
						return null;
					} catch (Exception e) {
						return null;
					}
				} else {
					try {
						InputStream stream = ctx.getContentResolver()
								.openInputStream(uri);
						return new BitmapDrawable(ctx.getResources(), stream);
					} catch (FileNotFoundException e) {
						return null;
					}
				}
			} else {
				for (String base : bases) {
					String path = base + uri;

					// Asset
					if (base.startsWith("file:///android_asset/")) {
						path = path.substring(22);

						try {
							InputStream stream = ctx.getAssets().open(path);
							return new BitmapDrawable(ctx.getResources(),
									stream);
						} catch (IOException e) {
							continue;
						}
					}
					// General URI
					else {
						try {
							InputStream stream = ctx.getContentResolver()
									.openInputStream(Uri.parse(path));
							return new BitmapDrawable(ctx.getResources(),
									stream);
						} catch (FileNotFoundException e) {
							continue;
						}
					}
				}
			}
		}

		return null;
	}

	/**
	 * ! Build a menu from a JSON definition.
	 * 
	 * Example definition: [{ icon: 'icons/new.png', text: 'New', click:
	 * function() { alert('Create something new!'); } }, { icon:
	 * 'icons/save.png', text: 'Save As', header: { icon: 'icons/save.png',
	 * title: 'Save file as...' }, items: [ { icon: 'icons/png.png', text:
	 * 'PNG', click: function() { alert('save as png'); } }, { icon:
	 * 'icons/jpeg.png', text: 'JPEG', click: function() { alert('save as
	 * jpeg'); } } ] }, { icon: 'fonts/fontawesome.ttf?U+0040', text: 'Contact',
	 * show: SHOW_AS_ACTION_NEVER }]
	 * 
	 * Note: By default all menu items have the show flag SHOW_AS_ACTION_IF_ROOM
	 * 
	 * @param menu
	 *            The menu to build the definition into
	 * @param definition
	 *            The menu definition (see example above)
	 * @return true if the definition was valid, false otherwise.
	 */
	private boolean buildMenu(Menu menu, JSONArray definition) {
		return buildMenu(menu, definition, "window.plugins.navBar.menu");
	}

	private boolean buildMenu(Menu menu, JSONArray definition, String menu_var) {
		// Sadly MenuItem.setIcon and SubMenu.setIcon have conficting return
		// types (for chaining), thus this can't be done w/ generics :(
		class GetMenuItemIconTask extends AsyncTask<String, Void, Drawable> {
			public final MenuItem item;
			public Exception exception = null;

			GetMenuItemIconTask(MenuItem item) {
				this.item = item;
			}

			@Override
			protected Drawable doInBackground(String... uris) {
				return getDrawableForURI(uris[0]);
			}

			@Override
			protected void onPostExecute(Drawable icon) {
				if (icon != null) {
					item.setIcon(icon);
				}
			}
		}
		;

		class GetSubMenuIconTask extends AsyncTask<String, Void, Drawable> {
			public final SubMenu item;
			public Exception exception = null;

			GetSubMenuIconTask(SubMenu item) {
				this.item = item;
			}

			@Override
			protected Drawable doInBackground(String... uris) {
				return getDrawableForURI(uris[0]);
			}

			@Override
			protected void onPostExecute(Drawable icon) {
				if (icon != null) {
					item.setIcon(icon);
				}
			}
		}
		;

		try {
			if(search_callback != null)
				addSearchView(menu);
			
			for (int i = 0; i < definition.length(); ++i) {
				final JSONObject item_def = definition.getJSONObject(i);
				final String text = item_def.isNull("text") ? "" : item_def
						.getString("text");

				if (!item_def.has("items")) {
					MenuItem item = menu.add(0, i, i, text);
					item.setTitleCondensed(text);
					if (item_def.isNull("icon") == false) {
						GetMenuItemIconTask task = new GetMenuItemIconTask(item);
						synchronized (task) {
							task.execute(item_def.getString("icon"));
						}
					}

					// Default to MenuItem.SHOW_AS_ACTION_IF_ROOM, otherwise
					// take user defined value.
					item.setShowAsAction(item_def.has("show") ? item_def
							.getInt("show") : MenuItem.SHOW_AS_ACTION_IF_ROOM
							| MenuItem.SHOW_AS_ACTION_WITH_TEXT);

					menu_callbacks.put(item, "var item = " + menu_var + "[" + i
							+ "]; if(item.click) item.click();");
				} else {
					SubMenu submenu = menu.addSubMenu(0, i, i, text);
					if (item_def.isNull("icon") == false) {
						GetSubMenuIconTask task = new GetSubMenuIconTask(
								submenu);

						synchronized (task) {
							task.execute(item_def.getString("icon"));
						}
					}

					// Set submenu header
					if (item_def.has("header")) {
						JSONObject header = item_def.getJSONObject("header");

						if (header.has("title")) {
							submenu.setHeaderTitle(header.getString("title"));
						}

						if (header.has("icon")) {
							submenu.setHeaderIcon(getDrawableForURI(header
									.getString("icon")));
						}
					}

					// Build sub-menu
					buildMenu(submenu, item_def.getJSONArray("items"), menu_var
							+ "[" + i + "].items");
				}
			}
		} catch (JSONException e) {
			return false;
		}
		return true;
	}

	private void addSearchView(Menu menu) {
		SearchView searchView = new SearchView((Activity) this.cordova);
		searchView.setQueryHint("Search...");
		searchView.setIconified(true);
		searchView.setOnQueryTextListener(new OnQueryTextListener() {
			@Override
			public boolean onQueryTextSubmit(String query) {
				String callback = search_callback+"('"+query+"');";
				webView.sendJavascript(callback);
//				search_callback.success(query);
				return true;
			}
			
			@Override
			public boolean onQueryTextChange(String newText) {
				// TODO Auto-generated method stub
				return false;
			}
		});

		menu.add("Search").setIcon(android.R.drawable.ic_menu_search)
				.setActionView(searchView)
				.setShowAsAction(MenuItem.SHOW_AS_ACTION_ALWAYS);
	}

	/**
	 * ! Build a tab bar from a JSON definition.
	 * 
	 * Example definition: [{ icon: 'icons/tab1_icon.png', text: 'Tab #1',
	 * select: function() { alert('View Tab #1!'); }, reselect: function() {
	 * alert('Refresh Tab #1!'); }, unselect: function() { alert('Hide Tab
	 * #1!'); } }, { icon: 'icons/tab2_icon.png', text: 'Tab #2', select:
	 * function() { alert('View Tab #2!'); }, reselect: function() {
	 * alert('Refresh Tab #2!'); }, unselect: function() { alert('Hide Tab
	 * #2!'); } }]
	 * 
	 * @param bar
	 *            The action bar to build the definition into
	 * @param definition
	 *            The tab bar definition (see example above)
	 * @return true if the definition was valid, false otherwise.
	 */
	private boolean buildTabs(ActionBar bar, JSONArray definition) {
		return buildTabs(bar, definition, "window.plugins.navBar.tabs");
	}

	private boolean buildTabs(ActionBar bar, JSONArray definition,
			String menu_var) {
		try {
			for (int i = 0; i < definition.length(); ++i) {
				final JSONObject item_def = definition.getJSONObject(i);
				final String text = item_def.isNull("text") ? "" : item_def
						.getString("text");
				final Drawable icon = item_def.isNull("icon") ? null
						: getDrawableForURI(item_def.getString("icon"));
				final boolean isSelected = item_def.optBoolean("selected",
						false);

				bar.addTab(
						bar.newTab()
								.setText(text)
								.setContentDescription(text)
								.setTag(text)
								.setIcon(icon)
								.setTabListener(
										new TabListener(this, menu_var + "["
												+ i + "]")), isSelected);
			}
		} catch (JSONException e) {
			return false;
		}

		return true;
	}

	private final static List<String> plugin_actions = Arrays
			.asList(new String[] { "isAvailable", "show", "hide", "isShowing",
					"getHeight", "setMenu", "setTabs", "setDisplayOptions",
					"getDisplayOptions", "setHomeButtonEnabled", "setIcon",
					"setListNavigation", "setLogo",
					"setDisplayShowHomeEnabled", "setDisplayHomeAsUpEnabled",
					"setDisplayShowTitleEnabled", "setDisplayUseLogoEnabled",
					"setNavigationMode", "getNavigationMode",
					"setSelectedNavigationItem", "setSelectedTab",
					"getSelectedNavigationItem", "setTitle", "getTitle",
					"setSubtitle", "getSubtitle", "onSearch"

			});

	@Override
	public boolean execute(final String action, final JSONArray args,
			final CallbackContext callbackContext) throws JSONException {
		if (!plugin_actions.contains(action)) {
			return false;
		}

		final Activity ctx = (Activity) cordova;

		if ("isAvailable".equals(action)) {
			JSONObject result = new JSONObject();
			result.put("value",
					ctx.getWindow().hasFeature(Window.FEATURE_ACTION_BAR));
			callbackContext.success(result);
			return true;
		}

		final ActionBar bar = ctx.getActionBar();
		if (bar == null) {
			Window window = ctx.getWindow();
			if (!window.hasFeature(Window.FEATURE_ACTION_BAR)) {
				callbackContext
						.error("ActionBar feature not available, Window.FEATURE_ACTION_BAR must be enabled!");
			} else {
				callbackContext.error("Failed to get ActionBar");
			}

			return true;
		}

		if (menu == null) {
			callbackContext.error("Options menu not initialised");
			return true;
		}

		final StringBuffer error = new StringBuffer();
		JSONObject result = new JSONObject();

		if ("isShowing".equals(action)) {
			result.put("value", bar.isShowing());
		} else if ("getHeight".equals(action)) {
			result.put("value", bar.getHeight());
		} else if ("getDisplayOptions".equals(action)) {
			result.put("value", bar.getDisplayOptions());
		} else if ("getNavigationMode".equals(action)) {
			result.put("value", bar.getNavigationMode());
		} else if ("getSelectedNavigationItem".equals(action)) {
			result.put("value", bar.getSelectedNavigationIndex());
		} else if ("getSubtitle".equals(action)) {
			result.put("value", bar.getSubtitle());
		} else if ("getTitle".equals(action)) {
			result.put("value", bar.getTitle());
		} else {
			try {
				JSONException exception = new Runnable() {
					public JSONException exception = null;

					public void run() {
						try {
							// This is a bit of a hack (should be specific to
							// the request, not global)
							bases = new String[] {
									removeFilename(webView.getOriginalUrl()),
									removeFilename(webView.getUrl()) };

							if ("show".equals(action)) {
								LOG.d("native5-action-bar",
										"Showing Action Bar");
								bar.show();
							} else if ("hide".equals(action)) {
								bar.hide();
							} else if ("setMenu".equals(action)) {
								if (args.isNull(0)) {
									error.append("menu can not be null");
									return;
								}

								menu_definition = args.getJSONArray(0);

								if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB) {
									ctx.invalidateOptionsMenu();
								}
							} else if ("setTabs".equals(action)) {
								if (args.isNull(0)) {
									error.append("menu can not be null");
									return;
								}

								bar.removeAllTabs();
								tab_callbacks.clear();

								if (!buildTabs(bar, args.getJSONArray(0))) {
									error.append("Invalid tab bar definition");
								}
							} else if ("setDisplayHomeAsUpEnabled"
									.equals(action)) {
								if (args.isNull(0)) {
									error.append("showHomeAsUp can not be null");
									return;
								}

								bar.setDisplayHomeAsUpEnabled(args
										.getBoolean(0));
							} else if ("setDisplayOptions".equals(action)) {
								if (args.isNull(0)) {
									error.append("options can not be null");
									return;
								}

								final int options = args.getInt(0);
								bar.setDisplayOptions(options);
							} else if ("setDisplayShowHomeEnabled"
									.equals(action)) {
								if (args.isNull(0)) {
									error.append("showHome can not be null");
									return;
								}

								bar.setDisplayShowHomeEnabled(args
										.getBoolean(0));
							} else if ("setDisplayShowTitleEnabled"
									.equals(action)) {
								if (args.isNull(0)) {
									error.append("showTitle can not be null");
									return;
								}

								bar.setDisplayShowTitleEnabled(args
										.getBoolean(0));
							} else if ("setDisplayUseLogoEnabled"
									.equals(action)) {
								if (args.isNull(0)) {
									error.append("useLogo can not be null");
									return;
								}

								bar.setDisplayUseLogoEnabled(args.getBoolean(0));
							} else if ("onSearch"
									.equals(action)) {
								if(args.isNull(0) == false)
								search_callback=args.getString(0);
								else search_callback=null;
							} else if ("setHomeButtonEnabled".equals(action)) {
								if (args.isNull(0)) {
									error.append("enabled can not be null");
									return;
								}

								bar.setHomeButtonEnabled(args.getBoolean(0));
							} else if ("setIcon".equals(action)) {
								if (args.isNull(0)) {
									error.append("icon can not be null");
									return;
								}

								Drawable drawable = getDrawableForURI(args
										.getString(0));
								bar.setIcon(drawable);
							} else if ("setListNavigation".equals(action)) {
								JSONArray items = null;
								if (args.isNull(0) == false) {
									items = args.getJSONArray(0);
								}

								navigation_adapter.setItems(items);
								bar.setListNavigationCallbacks(
										navigation_adapter, navigation_listener);
							} else if ("setLogo".equals(action)) {
								String uri = args.getString(0);
								if (args.isNull(0)) {
									error.append("logo can not be null");
									return;
								}

								// try {
								// InputStream ims = ctx.getAssets().open(uri);
								Drawable drawable = getDrawableForURI(uri);
								// Drawable.createFromStream(ims, null);
								bar.setLogo(drawable);
								bar.setBackgroundDrawable(getDrawableForURI("images/logo-bg.png"));
								// } catch (IOException e) {
								// e.printStackTrace();
								// }
							} else if ("setNavigationMode".equals(action)) {
								if (args.isNull(0)) {
									error.append("mode can not be null");
									return;
								}

								final int mode = args.getInt(0);
								bar.setNavigationMode(ActionBar.NAVIGATION_MODE_TABS);
							} else if ("setSelectedNavigationItem"
									.equals(action)) {
								if (args.isNull(0)) {
									error.append("position can not be null");
									return;
								}
								bar.setSelectedNavigationItem(args.getInt(0));
							} else if ("setSelectedTab".equals(action)) {
								if (args.isNull(0)) {
									error.append("position can not be null");
									return;
								}
								LOG.d("setSelectedTab", bar.getTabCount() + "");
								bar.selectTab(bar.getTabAt(args.getInt(0)));
							} else if ("setSubtitle".equals(action)) {
								if (args.isNull(0)) {
									error.append("subtitle can not be null");
									return;
								}

								bar.setSubtitle(args.getString(0));
							} else if ("setTitle".equals(action)) {
								if (args.isNull(0)) {
									error.append("title can not be null");
									return;
								}

								bar.setTitle(args.getString(0));
							}
						} catch (JSONException e) {
							exception = e;
						} finally {
							synchronized (this) {
								this.notify();
							}
						}
					}

					// Run task synchronously
					{
						synchronized (this) {
							ctx.runOnUiThread(this);
							this.wait();
						}
					}
				}.exception;

				if (exception != null) {
					throw exception;
				}
			} catch (InterruptedException e) {
				error.append("Function interrupted on UI thread");
			}
		}

		if (error.length() == 0) {
			if (result.length() > 0) {
				callbackContext.success(result);
			} else {
				callbackContext.success();
			}
		} else {
			callbackContext.error(error.toString());
		}

		return true;
	}

	public static class TabListener implements ActionBar.TabListener {
		private ActionBarPlugin plugin;
		private String js_item;

		public TabListener(ActionBarPlugin plugin, String js_item) {
			this.plugin = plugin;
			this.js_item = js_item;
		}

		public void onTabSelected(ActionBar.Tab tab, FragmentTransaction ft) {
			String callback = "var item = " + js_item
					+ "; if(item.select) item.select(item);";

			plugin.webView.sendJavascript(callback);
		}

		public void onTabUnselected(ActionBar.Tab tab, FragmentTransaction ft) {
			String callback = "var item = " + js_item
					+ "; if(item.unselect) item.unselect(item);";

			plugin.webView.sendJavascript(callback);
		}

		public void onTabReselected(ActionBar.Tab tab, FragmentTransaction ft) {
			String callback = "var item = " + js_item
					+ "; if(item.reselect) item.reselect(item);";

			plugin.webView.sendJavascript(callback);
		}
	}
}
